package portfolio.studytube.user.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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