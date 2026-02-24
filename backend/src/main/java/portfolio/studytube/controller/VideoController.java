package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.entity.User;
import portfolio.studytube.entity.UserVideo;
import portfolio.studytube.service.UserService;
import portfolio.studytube.service.VideoLibraryService;

import java.security.Principal;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoLibraryService videoLibraryService;

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
}