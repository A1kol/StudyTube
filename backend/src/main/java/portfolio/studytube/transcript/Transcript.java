package portfolio.studytube.transcript;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import portfolio.studytube.video.Video;


@Entity
@Table(name = "transcripts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transcript {
    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "video_id")
    private Video video;

    @Column(columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String chunks;

    // Наш новый кэш для ИИ
    @Column(columnDefinition = "TEXT")
    private String summary;
}