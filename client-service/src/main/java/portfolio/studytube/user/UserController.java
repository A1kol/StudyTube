package portfolio.studytube.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.user.dto.PasswordUpdateRequestDTO;
import portfolio.studytube.user.entity.User;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/password")
    public ResponseEntity<Void> updatePassword(
            @AuthenticationPrincipal User userFromFilter,
            @Valid @RequestBody PasswordUpdateRequestDTO request) {

        userService.updatePassword(userFromFilter, request.newPassword());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal User userFromFilter) {
        userService.deleteUser(userFromFilter);
        return ResponseEntity.noContent().build();
    }
}