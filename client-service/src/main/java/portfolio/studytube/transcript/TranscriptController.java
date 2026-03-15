package portfolio.studytube.transcript;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transcripts")
@RequiredArgsConstructor
public class TranscriptController {

    private final TranscriptRepository transcriptRepository;

    @GetMapping("/by-youtube-id/{youtubeId}")
    public ResponseEntity<TranscriptResponseDTO> getByYoutubeId(@PathVariable String youtubeId) {
        return transcriptRepository.findByVideoYoutubeId(youtubeId) // Нужен метод в репозитории
                .map(t -> ResponseEntity.ok(new TranscriptResponseDTO(
                        t.getVideo().getId(),
                        t.getContent()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

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