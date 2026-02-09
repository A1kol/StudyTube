package portfolio.studytube.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.entity.Video;

import java.util.Optional;

public interface VideoRepository extends JpaRepository<Video, Long> {
    Optional<Video> findByYoutubeId(String youtubeId);
}
