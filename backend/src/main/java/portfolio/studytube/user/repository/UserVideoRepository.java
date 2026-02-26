package portfolio.studytube.user.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.entity.UserVideo;
import portfolio.studytube.video.Video;

import java.util.List;
import java.util.Optional;

public interface UserVideoRepository extends JpaRepository<UserVideo, Long> {
    List<UserVideo> findAllByUserOrderByCreatedAtAsc(User user);
    Optional<UserVideo> findByUserAndVideo(User user, Video video);

    @Modifying
    @Transactional
    void deleteAllByUser(User user);
}
