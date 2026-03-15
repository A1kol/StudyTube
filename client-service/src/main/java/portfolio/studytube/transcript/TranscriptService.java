package portfolio.studytube.transcript;

import com.fasterxml.jackson.databind.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portfolio.studytube.exception.ServiceException;
import portfolio.studytube.video.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor

public class TranscriptService {
    private final TranscriptRepository transcriptRepository;
    private final VideoRepository videoRepository;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void fetchAndSaveTranscript(Video video, String youtubeId) {
        try {
            Video managedVideo = videoRepository.findById(video.getId())
                    .orElseThrow(() -> new ServiceException("TRANSCRIPT_NOT_FOUND", HttpStatus.NOT_FOUND));

            String jsonOutput = runPythonScript(youtubeId, "json");

            if (!jsonOutput.trim().startsWith("[")) {
                Transcript transcript = Transcript.builder()
                        .video(managedVideo)
                        .content(jsonOutput)
                        .chunks(null)
                        .build();
                transcriptRepository.saveAndFlush(transcript);
                System.out.println("⚠️ Сохранена ошибка транскрипта (субтитры не найдены)");
                return;
            }

            String plainText = extractPlainTextFromJson(jsonOutput);
            Transcript transcript = Transcript.builder()
                    .video(managedVideo)
                    .content(plainText)
                    .chunks(jsonOutput)
                    .build();

            transcriptRepository.saveAndFlush(transcript);
            System.out.println("✅ Транскрипт с таймкодами сохранен!");

        } catch (Exception e) {
            System.err.println("❌ Ошибка при сохранении: " + e.getMessage());
        }
    }

    public String getRawTranscriptWithTimestamps(String youtubeId) {
        return runPythonScript(youtubeId, "json");
    }

    private String runPythonScript(String youtubeId, String format) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "python3", "-m", "youtube_transcript_api", // Вызываем как модуль питона
                    youtubeId,
                    "--languages", "ru", "en",
                    "--format", format
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("Recording") || line.startsWith("Notice")) {
                        continue;
                    }
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Python exit code: " + exitCode);
            }

            return output.toString().trim();
        } catch (Exception e) {
            throw new RuntimeException("Ошибка Python: " + e.getMessage());
        }
    }

    private String extractPlainTextFromJson(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            StringBuilder sb = new StringBuilder();

            if (root.isArray() && root.has(0) && root.get(0).isArray()) {
                root = root.get(0);
            }

            if (root.isArray()) {
                for (JsonNode node : root) {
                    String text = node.path("text").asText("");
                    if (!text.isEmpty()) {
                        sb.append(text).append(" ");
                    }
                }
            }
            return sb.toString().trim();
        } catch (Exception e) {
            System.err.println("❌ Ошибка парсинга JSON: " + e.getMessage());
            return "Ошибка при обработке текста";
        }
    }
}