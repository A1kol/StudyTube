package portfolio.studytube.ai.model;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/ask")
    public String askAi(
            @RequestParam String videoId,
            @RequestParam String prompt,
            @AuthenticationPrincipal User user) {
        return aiService.processAsk(user.id(), videoId, prompt);
    }

    @PostMapping(value = "/summary", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getSummary(
            @RequestParam String videoId) {
        return aiService.generateSummaryStream(videoId);
    }
}