package portfolio.studytube.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.user.repository.UserVideoRepository;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserVideoRepository userVideoRepository;
    private final PasswordEncoder passwordEncoder;
    @Transactional
    public void updatePassword(User userFromFilter, String newPassword) {
        log.info("Updating password for user ID: {}", userFromFilter.getId());

        User user = userRepository.findById(userFromFilter.getId())
                .orElseThrow(() -> new ServiceException("USER_NOT_FOUND", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password updated successfully for user: {}", user.getMail());
    }

    @Transactional
    public void deleteUser(User userFromFilter) {
        User user = userRepository.findById(userFromFilter.getId()).orElseThrow( () -> {
            log.error("Failed to delete user: User with ID {} not found", userFromFilter.getId());
            return new ServiceException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        });

        userVideoRepository.deleteAllByUser(user);
        userRepository.delete(user);

        log.info("User with ID {} and all related data deleted successfully", userFromFilter.getId());
    }
}