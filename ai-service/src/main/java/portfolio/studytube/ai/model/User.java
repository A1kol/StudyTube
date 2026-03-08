package portfolio.studytube.ai.model;
import lombok.Builder;


@Builder
public record User(
        Long id,
        String name,
        String mail
) {}