package portfolio.studytube.tools;

import portfolio.studytube.dto.AuthRequestDTO;
import portfolio.studytube.entity.User;

public class Wrapper {
    public static User toEntity(AuthRequestDTO authRequestDTO) {
         return new User(null, authRequestDTO.name(), authRequestDTO.password());
    }
}
