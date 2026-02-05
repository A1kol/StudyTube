package portfolio.studytube.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import portfolio.studytube.dto.*;
import portfolio.studytube.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody AuthRequestDTO authRequestDTO) {
        try {
            authService.executeRegister(authRequestDTO);
            return ResponseEntity.ok().build();
        }
        catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequestDTO) {
        try {
            return ResponseEntity.ok(authService.executeLogin(authRequestDTO));
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
