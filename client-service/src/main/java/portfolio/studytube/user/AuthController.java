package portfolio.studytube.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.user.dto.LoginRequestDTO;
import portfolio.studytube.user.dto.RegisterRequestDTO;
import portfolio.studytube.user.dto.AuthResponseDTO;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.service.AuthService;
import portfolio.studytube.user.service.UserService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequestDTO userToRegister) {
        authService.executeRegister(userToRegister);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO userToLogin) {
        return ResponseEntity.ok(authService.executeLogin(userToLogin));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal User userFromFilter) {
        userService.deleteUser(userFromFilter);
        return ResponseEntity.noContent().build();
    }
}