package portfolio.studytube.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import portfolio.studytube.transcript.Transcript;
import portfolio.studytube.service.TranscriptService;
import portfolio.studytube.transcript.TranscriptRepository;
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
    private final TranscriptService transcriptService; // Для получения текста "на лету", если в БД пусто
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

        // 1. Пытаемся получить текст видео из БД, либо через скрипт (fallback)
        String videoContent = videoRepository.findByYoutubeId(youtubeId)
                .flatMap(transcriptRepository::findByVideo)
                .map(Transcript::getContent)
                .orElseGet(() -> {
                    try {
                        // Если в БД нет, используем твой метод для получения сырого текста
                        return transcriptService.getRawTranscriptWithTimestamps(youtubeId);
                    } catch (Exception e) {
                        return "Текст видео недоступен для анализа.";
                    }
                });

        // 2. Получаем историю чата из Redis
        List<String> history = redisTemplate.opsForList().range(redisKey, -historyLimit, -1);
        String historyContext = (history != null && !history.isEmpty())
                ? String.join("\n", history)
                : "Это начало обсуждения.";

        // 3. Формируем запрос: System Prompt (База) + User Prompt (Вопрос + История)
        String aiResponse = chatClient.prompt()
                .system(sp -> sp.text("Ты экспертный ассистент по обучению. " +
                        "Твоя задача — отвечать на вопросы, основываясь исключительно на предоставленном тексте видео. " +
                        "Если в тексте нет ответа, предложи пользователю уточнить вопрос.\n\n" +
                        "ТЕКСТ ВИДЕО:\n" + videoContent))
                .user(up -> up.text("ИСТОРИЯ ЧАТА:\n" + historyContext + "\n\nВОПРОС: " + prompt))
                .call()
                .content();

        // 4. Сохраняем в Redis и обновляем TTL
        redisTemplate.opsForList().rightPush(redisKey, "U: " + prompt);
        redisTemplate.opsForList().rightPush(redisKey, "AI: " + aiResponse);
        redisTemplate.expire(redisKey, ttlHours, TimeUnit.HOURS);

        return aiResponse;
    }

    public Flux<String> generateSummaryStream(String transcript) {
        // Ограничиваем входной текст для безопасности, если он гигантский
        String safeTranscript = transcript.length() > 30000
                ? transcript.substring(0, 30000)
                : transcript;

        System.out.println("DEBUG: AI начал обработку текста длиной: " + safeTranscript.length());

        return chatClient.prompt()
                .system("Ты — профессиональный ассистент по обучению. " +
                        "Составь содержательный конспект с буллитами и выделением терминов на языке оригинала.")
                .user("Сделай конспект этого текста: " + safeTranscript)
                .stream() // Магия здесь: переключаемся в режим потока
                .content();
    }
}