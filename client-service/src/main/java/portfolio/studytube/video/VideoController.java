package portfolio.studytube.video;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.entity.UserVideo;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/add")
    public ResponseEntity<UserVideo> addVideo(@RequestParam String url,
                                              @RequestParam(required = false, defaultValue = "General") String category,
                                              @AuthenticationPrincipal User user) {
        UserVideo result = videoService.addVideoToUserLibrary(url, user, category);
        return ResponseEntity.ok(result);
    }
}