package portfolio.studytube.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import portfolio.studytube.entity.Transcript;
import portfolio.studytube.entity.Video;
import portfolio.studytube.repository.TranscriptRepository;
import portfolio.studytube.repository.VideoRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class TranscriptService {
    private final TranscriptRepository transcriptRepository;
    private final VideoRepository videoRepository;
    private final ObjectMapper objectMapper;

    // --- ПУБЛИЧНЫЕ МЕТОДЫ ---

    /**
     * МЕТОД 1: Асинхронное сохранение в БД при добавлении видео.
     * Мы сразу сохраняем и чистый текст, и JSON-таймкоды (в chunks).
     */
    @Async
    @Transactional
    public void fetchAndSaveTranscript(Video video, String youtubeId) {
        try {
            Video managedVideo = videoRepository.findById(video.getId())
                    .orElseThrow(() -> new RuntimeException("Видео не найдено"));

            String jsonOutput = runPythonScript(youtubeId, "json");

            // ПРОВЕРКА: Если ответ не похож на JSON массив [ ... ]
            if (!jsonOutput.trim().startsWith("[")) {
                // Если это текст ошибки, сохраняем его только в content, а chunks оставляем null
                Transcript transcript = Transcript.builder()
                        .video(managedVideo)
                        .content(jsonOutput) // Текст ошибки запишется сюда
                        .chunks(null)        // В базу уйдет NULL, и Postgres не будет ругаться
                        .build();
                transcriptRepository.saveAndFlush(transcript);
                System.out.println("⚠️ Сохранена ошибка транскрипта (субтитры не найдены)");
                return;
            }

            // Если это нормальный JSON, парсим как обычно
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
    /**
     * МЕТОД 2: Просто получение транскрипта с таймкодами (например, для превью без сохранения).
     * Возвращает чистый JSON от Python-скрипта.
     */
    public String getRawTranscriptWithTimestamps(String youtubeId) {
        return runPythonScript(youtubeId, "json");
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ ПРИВАТНЫЕ МЕТОДЫ ---

    /**
     * Единая точка запуска Python-скрипта.
     */
    private String runPythonScript(String youtubeId, String format) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "youtube_transcript_api",
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
                    // Игнорируем только системный мусор Python
                    if (line.startsWith("Recording") || line.startsWith("Notice")) {
                        continue;
                    }
                    // Добавляем строку И ПЕРЕНОС, чтобы JSON не слипся в нечитаемую массу
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
    }    /**
     * Превращает массив JSON в плоский текст.
     */
    private String extractPlainTextFromJson(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            StringBuilder sb = new StringBuilder();

            // Если пришел массив массивов [[{...}]], берем первый элемент
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