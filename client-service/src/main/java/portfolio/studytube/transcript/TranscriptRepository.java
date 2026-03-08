package portfolio.studytube.transcript;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.video.Video;

import java.util.Optional;

public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    Optional<Transcript> findByVideoYoutubeId(String youtubeId);
}
