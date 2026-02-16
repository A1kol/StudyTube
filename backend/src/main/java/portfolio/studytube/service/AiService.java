package portfolio.studytube.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ChatModel chatModel;
    private final StringRedisTemplate redisTemplate;
    private ChatClient chatClient;

    @Value("${app.ai.chat.history-limit}")
    private int historyLimit;

    @Value("${app.ai.chat.ttl-hours}")
    private int ttlHours;

    @PostConstruct
    public void init() {
        this.chatClient = ChatClient.create(chatModel);
    }

    public String processAsk(String userId, String videoId, String prompt) {
        String redisKey = "chat_history:" + userId + ":" + videoId;

        // Получаем историю из Redis
        List<String> history = redisTemplate.opsForList().range(redisKey, -historyLimit, -1);
        String context = (history != null && !history.isEmpty())
                ? String.join("\n", history)
                : "Это начало обсуждения.";

        String fullPrompt = String.format(
                "Ты помощник в обучении. Контекст обсуждения видео (ID: %s):\n%s\n\nВопрос: %s",
                videoId, context, prompt
        );

        String aiResponse = chatClient.prompt()
                .user(fullPrompt)
                .call()
                .content();

        // Сохраняем и обновляем время жизни
        redisTemplate.opsForList().rightPush(redisKey, "U: " + prompt);
        redisTemplate.opsForList().rightPush(redisKey, "AI: " + aiResponse);
        redisTemplate.expire(redisKey, ttlHours, TimeUnit.HOURS);

        return aiResponse;
    }

    public String generateSummary(String transcript) {
        return chatClient.prompt()
                .system("Ты — профессиональный ассистент по обучению. " +
                        "Составь содержательный конспект с буллитами и выделением терминов.")
                .user("Сделай конспект: " + transcript)
                .call()
                .content();
    }
}