package portfolio.studytube.user.mapper;

import org.springframework.security.crypto.password.PasswordEncoder;
import portfolio.studytube.user.dto.RegisterRequestDTO;
import portfolio.studytube.user.entity.User;
import portfolio.studytube.user.dto.AuthResponseDTO;

public class UserMapper {
    public static User toEntity(RegisterRequestDTO authRequestDTO, PasswordEncoder passwordEncoder) {
         return new User(null, authRequestDTO.name(), authRequestDTO.mail(), passwordEncoder.encode(authRequestDTO.password()));
    }

    public static AuthResponseDTO toResponse(User user, String token) {
        return new AuthResponseDTO(
                user.getName(),
                user.getMail(),
                token
        );
    }
}
