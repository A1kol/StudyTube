package portfolio.studytube.video;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "videos")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String youtubeId;

    private String title;

    private String thumbnailUrl;
}