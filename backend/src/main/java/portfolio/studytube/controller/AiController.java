package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.service.AiService;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/ask")
    public String askAi(
            @RequestParam String prompt,
            @RequestParam String videoId,
            @RequestHeader("Authorization") String authHeader
    ) {
        // Здесь можно через jwtService вытащить именно ID, а не слать весь токен в ключ
        String userId = authHeader.substring(7);
        return aiService.processAsk(userId, videoId, prompt);
    }

    @PostMapping("/summary") // Поменял на POST для больших текстов
    public String getSummary(@RequestBody String transcript) {
        return aiService.generateSummary(transcript);
    }
}