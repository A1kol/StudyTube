package portfolio.studytube.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.transcript.Transcript;
import portfolio.studytube.transcript.TranscriptService;
import portfolio.studytube.transcript.TranscriptRepository;
import portfolio.studytube.video.Video;
import portfolio.studytube.video.VideoRepository;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AiService {
    private final ChatModel chatModel;
    private final StringRedisTemplate redisTemplate;
    private final TranscriptRepository transcriptRepository;
    private final VideoRepository videoRepository;
    private final TranscriptService transcriptService;
    private ChatClient chatClient;

    @Value("${app.ai.chat.history-limit}")
    private int historyLimit;

    @Value("${app.ai.chat.ttl-hours}")
    private int ttlHours;

    @PostConstruct
    public void init() {
        this.chatClient = ChatClient.create(chatModel);
    }

    public String processAsk(Long userId, String youtubeId, String prompt) {
        String redisKey = "chat_history:" + userId + ":" + youtubeId;

        String videoContent = videoRepository.findByYoutubeId(youtubeId)
                .flatMap(transcriptRepository::findByVideo)
                .map(Transcript::getContent)
                .orElseGet(() -> {
                    try {
                        return transcriptService.getRawTranscriptWithTimestamps(youtubeId);
                    } catch (Exception e) {
                        return "Текст видео недоступен для анализа.";
                    }
                });

        List<String> history = redisTemplate.opsForList().range(redisKey, -historyLimit, -1);
        String historyContext = (history != null && !history.isEmpty())
                ? String.join("\n", history)
                : "Это начало обсуждения.";

        String aiResponse = chatClient.prompt()
                .system(sp -> sp.text("Ты экспертный ассистент по обучению. " +
                        "Твоя задача — отвечать на вопросы, основываясь исключительно на предоставленном тексте видео. " +
                        "Если в тексте нет ответа, предложи пользователю уточнить вопрос.\n\n" +
                        "ТЕКСТ ВИДЕО:\n" + videoContent))
                .user(up -> up.text("ИСТОРИЯ ЧАТА:\n" + historyContext + "\n\nВОПРОС: " + prompt))
                .call()
                .content();

        redisTemplate.opsForList().rightPush(redisKey, "U: " + prompt);
        redisTemplate.opsForList().rightPush(redisKey, "AI: " + aiResponse);
        redisTemplate.expire(redisKey, ttlHours, TimeUnit.HOURS);

        return aiResponse;
    }

    public Flux<String> generateSummaryStream(String youtubeId) {
        return Flux.defer(() -> {
                    // 1. Ищем видео
                    Video video = videoRepository.findByYoutubeId(youtubeId)
                            .orElseThrow(() -> new ServiceException("VIDEO_NOT_FOUND", HttpStatus.NOT_FOUND));

                    // 2. Ищем транскрипт
                    Transcript transcript = transcriptRepository.findByVideo(video)
                            .orElseThrow(() -> new ServiceException("TRANSCRIPT_NOT_READY", HttpStatus.ACCEPTED));

                    // 3. Если конспект уже есть — отдаем его сразу
                    if (transcript.getSummary() != null && !transcript.getSummary().isBlank()) {
                        return Flux.just(transcript.getSummary());
                    }

                    // 4. Генерация через ИИ
                    StringBuilder fullSummary = new StringBuilder();

                    return chatClient.prompt()
                            .system("Ты — ассистент StudyTube. Сделай краткий конспект.")
                            .user("Текст видео: " + transcript.getContent())
                            .stream()
                            .content()
                            .doOnNext(fullSummary::append)
                            .doOnComplete(() -> {
                                // 5. Важный момент: сохраняем через репозиторий прямо тут
                                // Используем текущий объект transcript из замыкания
                                transcript.setSummary(fullSummary.toString());
                                transcriptRepository.save(transcript);
                                System.out.println("✅ Summary saved for: " + youtubeId);
                            });
                })
                // Если произошла ошибка внутри потока, она пробросится в GlobalHandler правильно
                .onErrorResume(e -> {
                    System.err.println("❌ AI Summary Error: " + e.getMessage());
                    return Flux.error(e);
                });
    }
}