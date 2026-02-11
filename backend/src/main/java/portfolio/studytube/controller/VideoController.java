package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import portfolio.studytube.entity.Video;
import portfolio.studytube.service.VideoService;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/add")
    public ResponseEntity<Video> addVideo(@RequestParam String url) {
        Video video = videoService.processNewVideo(url, null);
        return ResponseEntity.ok(video);
    }
}