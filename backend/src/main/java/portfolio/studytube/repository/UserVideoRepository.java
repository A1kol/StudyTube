package portfolio.studytube.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.entity.User;
import portfolio.studytube.entity.UserVideo;
import portfolio.studytube.entity.Video;

import java.util.List;
import java.util.Optional;

public interface UserVideoRepository extends JpaRepository<UserVideo, Long> {
    List<UserVideo> findAllByUserOrderByCreatedAtAsc(User user);
    Optional<UserVideo> findByUserAndVideo(User user, Video video);
}
