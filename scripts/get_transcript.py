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

    # ПУТЬ К КУКАМ (внутри контейнера Docker)
    cookies_path = '/app/cookies.txt'

    try:
        # Прямой вызов через модуль
        fetcher = youtube_transcript_api.YouTubeTranscriptApi

        # ДОБАВЛЯЕМ ПАРАМЕТР cookies
        transcript = fetcher.get_transcript(
            video_id,
            languages=['ru', 'en'],
            cookies=cookies_path
        )

        text = " ".join([t['text'] for t in transcript])
        print(text)
    except Exception as e:
        # Теперь ошибка будет более детальной, если куки не сработают
        print(f"Ошибка внутри скрипта: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()