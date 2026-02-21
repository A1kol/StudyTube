package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.entity.User;
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
            @AuthenticationPrincipal User user) {
        System.out.println(user);
        // Здесь можно через jwtService вытащить именно ID, а не слать весь токен в ключ
        return aiService.processAsk(user.getId(), videoId, prompt);
    }

    @PostMapping("/summary") // Поменял на POST для больших текстов
    public String getSummary(@RequestBody String transcript) {
        return aiService.generateSummary(transcript);
    }
}