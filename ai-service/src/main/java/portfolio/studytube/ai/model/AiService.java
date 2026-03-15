package portfolio.studytube.ai.model;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatModel chatModel;
    private final StringRedisTemplate redisTemplate;
    private final AiSummaryRepository summaryRepository;
    private final RestTemplate restTemplate;
    private ChatClient chatClient;

    @Value("${app.ai.chat.history-limit:10}")
    private int historyLimit;

    @Value("${app.ai.chat.ttl-hours:24}")
    private int ttlHours;

    @PostConstruct
    public void init() {
        this.chatClient = ChatClient.create(chatModel);
    }


    public String processAsk(Long userId, String videoId, String prompt) {
        // 1. Получаем транскрипт (с проверкой на null/empty внутри)
        String videoContent = getOrFetchTranscript(videoId);

        String redisKey = "chat_history:" + userId + ":" + videoId;

        // 2. Работа с историей в Redis
        List<String> history = redisTemplate.opsForList().range(redisKey, -historyLimit, -1);
        String historyContext = (history != null && !history.isEmpty())
                ? String.join("\n", history)
                : "Начало диалога.";

        // 3. Запрос к AI
        String aiResponse = chatClient.prompt()
                .system("Ты эксперт StudyTube. Отвечай строго по тексту видео:\n" + videoContent)
                .user("История чата:\n" + historyContext + "\nВопрос: " + prompt)
                .call()
                .content();

        // 4. Сохранение истории
        redisTemplate.opsForList().rightPush(redisKey, "U: " + prompt);
        redisTemplate.opsForList().rightPush(redisKey, "AI: " + aiResponse);
        redisTemplate.expire(redisKey, ttlHours, TimeUnit.HOURS);

        return aiResponse;
    }


    public Flux<String> generateSummaryStream(String videoId) {
        // Захватываем токен СРАЗУ, пока мы в потоке запроса
        String authHeader = getCurrentAuthHeader();

        return Flux.defer(() -> {
            // 1. Проверка в локальной базе AI-сервиса
            var existing = summaryRepository.findByYoutubeId(videoId);
            if (existing.isPresent() && existing.get().getSummary() != null) {
                return Flux.just(existing.get().getSummary());
            }

            // 2. Получение транскрипта из client-service
            String videoContent = fetchTranscriptFromClientService(videoId, authHeader);

            if (videoContent == null || videoContent.isBlank()) {
                log.warn("Транскрипт не найден для видео {}", videoId);
                return Flux.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Transcript not ready yet"));
            }

            // 3. Стриминг от AI
            StringBuilder fullSummary = new StringBuilder();
            return chatClient.prompt()
                    .system("Сделай подробный и структурированный конспект этого видео на языке оригинала.")
                    .user(videoContent)
                    .stream()
                    .content()
                    .doOnNext(fullSummary::append)
                    .doOnComplete(() -> {
                        // 4. Сохранение только по завершении
                        AiSummary summary = existing.orElse(new AiSummary());
                        summary.setYoutubeId(videoId);
                        summary.setSummary(fullSummary.toString());
                        summary.setRawTranscript(videoContent);
                        summaryRepository.save(summary);
                        log.info("✅ Конспект успешно сохранен для видео: {}", videoId);
                    });
        }).onErrorResume(e -> {
            log.error("❌ Ошибка в стриме AI: {}", e.getMessage());
            return Flux.error(e);
        });
    }


    private String getOrFetchTranscript(String videoId) {
        return summaryRepository.findByYoutubeId(videoId)
                .map(AiSummary::getRawTranscript)
                .filter(t -> !t.isBlank())
                .orElseGet(() -> {
                    String content = fetchTranscriptFromClientService(videoId, getCurrentAuthHeader());
                    if (content == null || content.isBlank()) {
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transcript for this video is unavailable");
                    }
                    return content;
                });
    }


    private String fetchTranscriptFromClientService(String youtubeId, String authHeader) {
        if (authHeader == null) {
            log.error("No Authorization header found for internal request");
            return null;
        }

        String url = "http://studytube-client:8080/api/transcripts/by-youtube-id/" + youtubeId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<TranscriptResponseDTO> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, TranscriptResponseDTO.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().content();
            }
            return null;
        } catch (Exception e) {
            log.error("❌ Client-Service request failed: {}", e.getMessage());
            return null;
        }
    }


    private String getCurrentAuthHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest().getHeader("Authorization");
        }
        return null;
    }
}