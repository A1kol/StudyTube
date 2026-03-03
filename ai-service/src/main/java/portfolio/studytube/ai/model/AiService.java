package portfolio.studytube.ai.model;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
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

    // Метод для чата по видео
    public String processAsk(Long userId, String videoId, String prompt) {
        String redisKey = "chat_history:" + userId + ":" + videoId;

        // Получаем текст видео (сначала из нашей базы саммари, если там сохранили оригинал, иначе из client-service)
        String videoContent = summaryRepository.findByYoutubeId(videoId)
                .map(AiSummary::getRawTranscript)
                .orElseGet(() -> fetchTranscriptFromClientService(videoId));

        List<String> history = redisTemplate.opsForList().range(redisKey, -historyLimit, -1);
        String historyContext = (history != null && !history.isEmpty()) ? String.join("\n", history) : "Начало диалога.";

        String aiResponse = chatClient.prompt()
                .system("Ты эксперт. Отвечай по тексту видео:\n" + videoContent)
                .user("История:\n" + historyContext + "\nВопрос: " + prompt)
                .call()
                .content();

        redisTemplate.opsForList().rightPush(redisKey, "U: " + prompt);
        redisTemplate.opsForList().rightPush(redisKey, "AI: " + aiResponse);
        redisTemplate.expire(redisKey, ttlHours, TimeUnit.HOURS);

        return aiResponse;
    }

    // Метод для генерации саммари (стриминг)
    public Flux<String> generateSummaryStream(String videoId) {
        return Flux.defer(() -> {
            var existing = summaryRepository.findByYoutubeId(videoId);

            if (existing.isPresent() && existing.get().getSummary() != null) {
                return Flux.just(existing.get().getSummary());
            }

            String videoContent = fetchTranscriptFromClientService(videoId);
            StringBuilder fullSummary = new StringBuilder();

            return chatClient.prompt()
                    .system("Сделай подробный конспект этого видео.")
                    .user(videoContent)
                    .stream()
                    .content()
                    .doOnNext(fullSummary::append)
                    .doOnComplete(() -> {
                        AiSummary summary = existing.orElse(new AiSummary());
                        summary.setYoutubeId(videoId);
                        summary.setSummary(fullSummary.toString());
                        summary.setRawTranscript(videoContent); // Кэшируем оригинал для чата
                        summaryRepository.save(summary);
                        log.info("✅ Конспект сохранен для видео: {}", videoId);
                    });
        }).onErrorResume(e -> {
            log.error("❌ Ошибка ИИ: {}", e.getMessage());
            return Flux.error(e);
        });
    }

    private String fetchTranscriptFromClientService(String youtubeId) {
        // Стучимся по новому пути, который мы только что создали
        String url = "http://client-service:8080/api/transcripts/by-youtube-id/" + youtubeId;

        try {
            TranscriptResponseDTO response = restTemplate.getForObject(url, TranscriptResponseDTO.class);
            return (response != null) ? response.content() : "Текст не найден";
        } catch (Exception e) {
            log.error("Ошибка запроса к client-service: {}", e.getMessage());
            return "Ошибка: не удалось получить транскрипт.";
        }
    }

    public record TranscriptResponseDTO(Long videoId, String content) {}
}