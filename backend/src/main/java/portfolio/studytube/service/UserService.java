package portfolio.studytube.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.studytube.entity.User;
import portfolio.studytube.repository.UserRepository;
import portfolio.studytube.repository.UserVideoRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserVideoRepository userVideoRepository;

    @Transactional
    public void deleteUser(User userFromFilter) {
        // 1. Находим реального юзера с ID
        User user = userRepository.findByName(userFromFilter.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Сначала чистим его библиотеку видео (UserVideo)
        userVideoRepository.deleteAllByUser(user);

        // 3. Теперь удаляем самого юзера
        userRepository.delete(user);
    }
}
