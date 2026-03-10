package portfolio.studytube.video;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.client.RestTemplate;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.transcript.TranscriptService;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.entity.UserVideo;
import portfolio.studytube.user.repository.UserRepository;
import portfolio.studytube.user.repository.UserVideoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepository;
    private final UserVideoRepository userVideoRepository;
    private final UserRepository userRepository;
    private final TranscriptService transcriptService;
    private final RestTemplate restTemplate;

    @Transactional
    public UserVideo addVideoToUserLibrary(String url, User userFromFilter, String category) {
        String youtubeId = extractYoutubeId(url);

        Video video = getOrCreateVideo(youtubeId);

        User user = userRepository.findById(userFromFilter.getId())
                .orElseThrow(() -> new ServiceException("USER_NOT_FOUND", HttpStatus.NOT_FOUND));

        return userVideoRepository.findByUserAndVideo(user, video)
                .map(existingLink -> {
                    if (!category.equals("General") && !category.isBlank() ) {
                        existingLink.setCategory(category);
                    }
                        existingLink.setCreatedAt(LocalDateTime.now());
                        return userVideoRepository.save(existingLink);
                })
                .orElseGet(() -> {
                    handleUserLibraryLimit(user);

                    UserVideo newUserVideo = UserVideo.builder()
                            .user(user)
                            .video(video)
                            .category(category)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return userVideoRepository.save(newUserVideo);
                });
    }

    private Video getOrCreateVideo(String youtubeId) {
        return videoRepository.findByYoutubeId(youtubeId)
                .orElseGet(() -> {
                    Map<String, String> metadata = fetchYouTubeMetadata(youtubeId);

                    Video newVideo = Video.builder()
                            .youtubeId(youtubeId)
                            .title(metadata.getOrDefault("title", "YouTube Video"))
                            .thumbnailUrl(metadata.getOrDefault("thumbnail", ""))
                            .build();

                    Video savedVideo = videoRepository.save(newVideo);

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

    private void handleUserLibraryLimit(User user) {
        List<UserVideo> userLibrary = userVideoRepository.findAllByUserOrderByCreatedAtAsc(user);
        if (userLibrary.size() >= 10) {
            userVideoRepository.delete(userLibrary.get(0));
        }
    }

    public String extractYoutubeId(String url) {
        if (url == null || url.isBlank()) throw new ServiceException("URL_EMPTY", HttpStatus.BAD_REQUEST);
        if (url.length() == 11) return url;

        String regex = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?v%3D|watch\\?feature=player_embedded&v=|%2Fvideos%2F|embed%2F|youtu.be%2F|%2Fv%2F)[^#&?\\n]+";
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(url);

        if (matcher.find()) return matcher.group();
        throw new ServiceException("INVALID_YOUTUBE_URL", HttpStatus.BAD_REQUEST);
    }

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
        }
        return Map.of("title", "YouTube Video", "thumbnail", "");
    }
}