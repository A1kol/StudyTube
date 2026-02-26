package portfolio.studytube.video;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoRepository extends JpaRepository<Video, Long> {
    Optional<Video> findByYoutubeId(String youtubeId);
}
