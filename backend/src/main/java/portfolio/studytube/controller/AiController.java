package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final ChatModel chatModel;
    private ChatClient chatClient;

    @PostConstruct
    public void init() {
        this.chatClient = ChatClient.create(chatModel);
    }

    @GetMapping("/ask")
    public String askAi(@RequestParam(value = "prompt") String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}