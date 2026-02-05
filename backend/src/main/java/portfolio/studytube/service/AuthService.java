package portfolio.studytube.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import portfolio.studytube.dto.*;
import portfolio.studytube.entity.User;
import portfolio.studytube.repository.UserRepository;
import portfolio.studytube.tools.Wrapper;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    public void executeRegister(AuthRequestDTO userToRegister) {
        if (userToRegister.name() == null || userToRegister.name().isBlank()) {
            throw new RuntimeException("Name cannot be empty");
        }
        if (userRepository.findByName(userToRegister.name()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        if (userToRegister.password().length() < 6 || userToRegister.password().length() > 12) {
            throw new RuntimeException("Not available password");
        }

        userRepository.save(Wrapper.toEntity(userToRegister));
    }

    public AuthResponseDTO executeLogin(AuthRequestDTO authRequestDTO) {
        User user = userRepository.findByName(authRequestDTO.name())
                .orElseThrow(() -> new RuntimeException("No such user found"));

        if(!user.getPassword().equals(authRequestDTO.password())) {
            throw new RuntimeException("Invalid password");
        }

        return new AuthResponseDTO(user.getName());
    }
}
