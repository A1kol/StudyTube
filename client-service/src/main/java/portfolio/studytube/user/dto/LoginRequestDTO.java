package portfolio.studytube.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
        @NotBlank(message = "MAIL_REQUIRED")
        String mail,

        @NotBlank(message = "PASSWORD_REQUIRED")
        @Size(min = 6, max = 16, message = "INVALID_PASSWORD_LENGTH")
        String password
) {}
