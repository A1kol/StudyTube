package portfolio.studytube.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import portfolio.studytube.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
}
