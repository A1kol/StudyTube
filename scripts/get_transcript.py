import sys
import io
import youtube_transcript_api

# Исправляем кодировку для Java
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    if len(sys.argv) < 2:
        print("Error: No ID")
        sys.exit(1)

    video_id = sys.argv[1]

    try:
        # Прямой вызов через модуль, минуя поиск класса
        # Мы используем метод напрямую из загруженного модуля
        fetcher = youtube_transcript_api.YouTubeTranscriptApi
        transcript = fetcher.get_transcript(video_id, languages=['ru', 'en'])

        text = " ".join([t['text'] for t in transcript])
        print(text)
    except Exception as e:
        print(f" Ошибка внутри скрипта: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()