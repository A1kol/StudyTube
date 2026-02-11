package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.dto.TranscriptResponseDTO;
import portfolio.studytube.repository.TranscriptRepository;

@RestController
@RequestMapping("/api/transcripts")
@RequiredArgsConstructor
public class TranscriptController {

    private final TranscriptRepository transcriptRepository;

    // Эндпоинт 1: Только текст (chunks будет отсутствовать в JSON благодаря @JsonInclude)
    @GetMapping("/{videoId}")
    public ResponseEntity<TranscriptResponseDTO> getTranscript(@PathVariable Long videoId) {
        return transcriptRepository.findById(videoId)
                .map(t -> ResponseEntity.ok(new TranscriptResponseDTO(
                        t.getVideo().getId(),
                        t.getContent()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // Эндпоинт 2: Полные данные (и текст, и таймкоды)
    @GetMapping("/{videoId}/full")
    public ResponseEntity<TranscriptResponseDTO> getFullTranscript(@PathVariable Long videoId) {
        return transcriptRepository.findById(videoId)
                .map(t -> ResponseEntity.ok(new TranscriptResponseDTO(
                        t.getVideo().getId(),
                        t.getContent(),
                        t.getChunks()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}