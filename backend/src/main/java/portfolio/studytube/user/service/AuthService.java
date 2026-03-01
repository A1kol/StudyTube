package portfolio.studytube.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.security.JwtService;
import portfolio.studytube.user.dto.LoginRequestDTO;
import portfolio.studytube.user.mapper.UserMapper;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.repository.UserRepository;
import portfolio.studytube.user.dto.RegisterRequestDTO;
import portfolio.studytube.user.dto.AuthResponseDTO;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            log.warn("Login failed: Invalid password for user with email {}", dto.mail());
            throw new ServiceException("INVALID_PASSWORD", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user);
        log.info("User {} successfully authenticated", user.getName());

        return UserMapper.toResponse(user, token);
    }

    private void validateRegistration(RegisterRequestDTO dto1) {
        if (userRepository.existsByMail(dto1.mail()) || userRepository.existsByMail(dto1.mail())) {
            log.warn("Registration failed: User {} is already exists", dto1.mail());
            throw new ServiceException("USER_ALREADY_EXISTS", HttpStatus.CONFLICT);
        }
    }
}