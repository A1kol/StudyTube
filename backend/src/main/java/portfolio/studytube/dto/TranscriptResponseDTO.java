package portfolio.studytube.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

// Аннотация заставит Jackson НЕ отправлять поле в JSON, если оно null
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TranscriptResponseDTO(
        Long videoId,
        String content,
        String chunks
) {
    // Компактный конструктор для случая, когда нужны только базовые данные
    public TranscriptResponseDTO(Long videoId, String content) {
        this(videoId, content, null);
    }
}