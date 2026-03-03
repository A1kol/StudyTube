package portfolio.studytube.ai.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaRepositories(basePackages = "portfolio.studytube.ai.model")
@Entity
@Table(name = "ai_summaries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String youtubeId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String rawTranscript;
}