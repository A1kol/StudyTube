package portfolio.studytube.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import portfolio.studytube.entity.User;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @DeleteMapping
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal User user) {

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
