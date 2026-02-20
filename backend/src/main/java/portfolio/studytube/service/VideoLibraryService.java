package portfolio.studytube.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.studytube.entity.User;
import portfolio.studytube.entity.UserVideo;
import portfolio.studytube.entity.Video;
import portfolio.studytube.repository.UserVideoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VideoLibraryService {

    private final UserVideoRepository userVideoRepository;
    private final VideoService videoService; // Добавляем сервис для работы с метаданными

    @Transactional
    public UserVideo addVideoToUserLibrary(String youtubeId, User user, String category) {

        // 1. Используем VideoService, чтобы получить видео БЕЗ заглушек (уже с Title и Thumb)
        Video video = videoService.getOrCreateVideo(youtubeId);

        // 2. Проверяем, есть ли уже связь этого юзера с этим видео
        Optional<UserVideo> existingLink = userVideoRepository.findByUserAndVideo(user, video);

        if (existingLink.isPresent()) {
            UserVideo link = existingLink.get();
            link.setCategory(category);
            // Обновляем дату, чтобы видео поднялось в топ списка (опционально)
            link.setCreatedAt(LocalDateTime.now());
            return userVideoRepository.save(link);
        }

        // 3. Контроль лимита в 10 видео
        List<UserVideo> userLibrary = userVideoRepository.findAllByUserOrderByCreatedAtAsc(user);

        if (userLibrary.size() >= 10) {
            // Удаляем самое старое видео из библиотеки пользователя
            userVideoRepository.delete(userLibrary.get(0));
        }

        // 4. Создаем новую запись в библиотеке
        UserVideo newUserVideo = UserVideo.builder()
                .user(user)
                .video(video)
                .category(category)
                .createdAt(LocalDateTime.now())
                .build();

        return userVideoRepository.save(newUserVideo);
    }
}