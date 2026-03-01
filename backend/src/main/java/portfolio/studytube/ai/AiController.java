package portfolio.studytube.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.user.entity.User;
import reactor.core.publisher.Flux;

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
        return aiService.processAsk(user.getId(), videoId, prompt);
    }

    @PostMapping(value = "/summary", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getSummary(
            @RequestParam String videoId,
            @AuthenticationPrincipal User user) {

        return aiService.generateSummaryStream(videoId);
    }
}