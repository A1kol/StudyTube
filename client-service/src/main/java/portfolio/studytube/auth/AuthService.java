package portfolio.studytube.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portfolio.studytube.auth.dto.AuthResponseDTO;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.security.JwtService;
import portfolio.studytube.auth.dto.LoginRequestDTO;
import portfolio.studytube.user.mapper.UserMapper;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.repository.UserRepository;
import portfolio.studytube.auth.dto.RegisterRequestDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Логика для Google OAuth2: поиск или регистрация без пароля
     */
    @Transactional
    public String processOAuthPostLogin(String email, String name) {
        log.info("Processing OAuth2 login for email: {}", email);

        User user = userRepository.findByMail(email)
                .orElseGet(() -> {
                    log.info("Creating new user from Google account: {}", email);
                    User newUser = User.builder()
                            .mail(email)
                            .name(name)
                            .password(null) // Пароля нет для Google-аккаунтов
                            .build();
                    return userRepository.save(newUser);
                });

        return jwtService.generateToken(user);
    }

    public void executeRegister(RegisterRequestDTO dto) {
        log.info("Attempting to register new user with email: {}", dto.mail());
        validateRegistration(dto);

        User savedUser = userRepository.save(UserMapper.toEntity(dto, passwordEncoder));
        log.info("User successfully registered. ID assigned: {}", savedUser.getId());
    }

    public AuthResponseDTO executeLogin(LoginRequestDTO dto) {
        log.info("Login attempt for email: {}", dto.mail());

        User user = userRepository.findByMail(dto.mail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User with email {} not found", dto.mail());
                    return new ServiceException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
                });

        // Защита: если пароль null, значит регистрация была через Google
        if (user.getPassword() == null) {
            log.warn("Login failed: User {} must login via Google", dto.mail());
            throw new ServiceException("PLEASE_LOGIN_WITH_GOOGLE", HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user with email {}", dto.mail());
            throw new ServiceException("INVALID_PASSWORD", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user);
        log.info("User {} successfully authenticated", user.getName());

        return UserMapper.toResponse(user, token);
    }

    private void validateRegistration(RegisterRequestDTO dto) {
        if (userRepository.existsByMail(dto.mail())) {
            log.warn("Registration failed: User {} already exists", dto.mail());
            throw new ServiceException("USER_ALREADY_EXISTS", HttpStatus.CONFLICT);
        }
    }
}