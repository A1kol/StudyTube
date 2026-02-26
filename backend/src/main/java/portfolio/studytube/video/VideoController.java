package portfolio.studytube.video;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import portfolio.studytube.service.TranscriptService;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.entity.UserVideo;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final portfolio.studytube.video.VideoService videoLibraryService;

    @PostMapping("/add")
    public ResponseEntity<UserVideo> addVideo(@RequestParam String url,
                                              @RequestParam(required = false, defaultValue = "General") String category,
                                              @AuthenticationPrincipal User user) {

        String youtubeId = extractYoutubeId(url);

        UserVideo result = videoLibraryService.addVideoToUserLibrary(youtubeId, user, category);

        return ResponseEntity.ok(result);
    }

    private String extractYoutubeId(String url) {
        if (url.contains("v=")) {
            return url.split("v=")[1].split("&")[0];
        } else if (url.contains("youtu.be/")) {
            return url.split("youtu.be/")[1].split("\\?")[0];
        }
        return url;
    }

    @Service
    @RequiredArgsConstructor
    public static class VideoService {
        private final VideoRepository videoRepository;
        private final TranscriptService transcriptService;
        private final RestTemplate restTemplate;

        /**
         * Основной метод для получения или создания видео.
         * Сразу тянет название и превью, чтобы не было заглушек в БД.
         */
        @Transactional
        public Video getOrCreateVideo(String youtubeId) {
            return videoRepository.findByYoutubeId(youtubeId)
                    .orElseGet(() -> {
                        // 1. Сразу тянем реальную инфу из YouTube oEmbed
                        Map<String, String> metadata = fetchYouTubeMetadata(youtubeId);

                        Video newVideo = Video.builder()
                                .youtubeId(youtubeId)
                                .title(metadata.getOrDefault("title", "YouTube Video"))
                                .thumbnailUrl(metadata.getOrDefault("thumbnail", ""))
                                .build();

                        // 2. Сохраняем видео с готовыми данными
                        Video savedVideo = videoRepository.save(newVideo);

                        // 3. Запускаем получение транскрипта строго после коммита основной транзакции
                        if (TransactionSynchronizationManager.isActualTransactionActive()) {
                            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                                @Override
                                public void afterCommit() {
                                    transcriptService.fetchAndSaveTranscript(savedVideo, youtubeId);
                                }
                            });
                        }
                        return savedVideo;
                    });
        }

        /**
         * Получение метаданных (Title, Thumbnail) через YouTube oEmbed API.
         */
        private Map<String, String> fetchYouTubeMetadata(String youtubeId) {
            try {
                String url = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + youtubeId + "&format=json";
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);

                if (response != null) {
                    return Map.of(
                            "title", (String) response.getOrDefault("title", "YouTube Video"),
                            "thumbnail", (String) response.getOrDefault("thumbnail_url", "")
                    );
                }
            } catch (Exception e) {
                System.err.println("Ошибка oEmbed для ID " + youtubeId + ": " + e.getMessage());
            }
            return Map.of("title", "YouTube Video", "thumbnail", "");
        }

        /**
         * Универсальный экстрактор ID из любых ссылок YouTube.
         */
        public String extractYoutubeId(String url) {
            if (url == null) return null;
            if (url.length() == 11) return url; // Уже ID

            String regex = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#&?\\n]+";
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(url);

            if (matcher.find()) {
                return matcher.group();
            }

            throw new IllegalArgumentException("Некорректная ссылка YouTube!");
        }
    }
}