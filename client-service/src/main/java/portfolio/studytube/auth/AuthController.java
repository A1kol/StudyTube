package portfolio.studytube.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.auth.dto.AuthResponseDTO;
import portfolio.studytube.auth.dto.LoginRequestDTO;
import portfolio.studytube.auth.dto.RegisterRequestDTO;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
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
}