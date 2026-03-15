package portfolio.studytube.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "USER_NAME_REQUIRED")
        String name,

        @NotBlank(message = "PASSWORD_REQUIRED")
        @Size(min = 6, max = 16, message = "INVALID_PASSWORD_LENGTH")
        String password,

        @NotBlank(message = "MAIL_REQUIRED")
        @Email(message = "INVALID_EMAIL_FORMAT")
        String mail
) {}