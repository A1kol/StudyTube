package portfolio.studytube.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import portfolio.studytube.entity.User;
import portfolio.studytube.entity.Video;
import portfolio.studytube.repository.VideoRepository;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepository;
    private final TranscriptService transcriptService;

    @Transactional
    public Video processNewVideo(String url, User user) {
        String yId = extractYoutubeId(url);

        return videoRepository.findByYoutubeId(yId)
                .orElseGet(() -> {
                    // 1. Создаем объект видео
                    Video newVideo = Video.builder()
                            .youtubeId(yId)
                            .title("Загрузка текста...")
                            .addedBy(user)
                            .build();

                    // 2. Сохраняем в БД (но транзакция еще не закомичена!)
                    Video savedVideo = videoRepository.save(newVideo);

                    // 3. Регистрируем действие ПОСЛЕ коммита транзакции
                    if (TransactionSynchronizationManager.isActualTransactionActive()) {
                        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                // Этот код выполнится только когда видео физически будет в БД
                                transcriptService.fetchAndSaveTranscript(savedVideo, yId);
                            }
                        });
                    } else {
                        // Если вдруг транзакции нет (на всякий случай), запускаем сразу
                        transcriptService.fetchAndSaveTranscript(savedVideo, yId);
                    }

                    return savedVideo;
                });
    }

    private String extractYoutubeId(String url) {
        String regex = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#&?\\n]+";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(url);

        if (matcher.find()) {
            return matcher.group();
        } else {
            if (url != null && url.length() == 11) return url;
            throw new IllegalArgumentException("Некорректная ссылка YouTube!");
        }
    }
}