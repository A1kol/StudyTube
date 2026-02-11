package portfolio.studytube.tools;

import org.springframework.security.crypto.password.PasswordEncoder;
import portfolio.studytube.dto.AuthRequestDTO;
import portfolio.studytube.entity.User;

public class Wrapper {
    public static User toEntity(AuthRequestDTO authRequestDTO, PasswordEncoder passwordEncoder) {
         return new User(null, authRequestDTO.name(), authRequestDTO.mail(), passwordEncoder.encode(authRequestDTO.password()));
    }
}
