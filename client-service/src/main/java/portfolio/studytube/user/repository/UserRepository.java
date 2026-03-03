package portfolio.studytube.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
    Optional<User> findByMail(String mail);

    @Deprecated
    boolean existsById(Long id);

    boolean existsByMail(String mail);
}
