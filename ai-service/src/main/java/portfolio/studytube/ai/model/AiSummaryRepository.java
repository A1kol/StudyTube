package portfolio.studytube.ai.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiSummaryRepository extends JpaRepository<AiSummary, Long> {
    Optional<AiSummary> findByYoutubeId(String youtubeId);
}
