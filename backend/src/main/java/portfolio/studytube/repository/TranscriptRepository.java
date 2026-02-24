package portfolio.studytube.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.entity.Transcript;
import portfolio.studytube.entity.Video;

import java.util.Optional;

public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    Optional<Transcript> findByVideo(Video video);
}
