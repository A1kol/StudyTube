package portfolio.studytube.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.entity.Transcript;

public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
}
