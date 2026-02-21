'use client'
import classes from "./ChatPart.module.scss"
import { useState, useRef, useEffect } from "react"

interface ChatPartProps {
    youtubeId?: string;
    videoUrl?: string;
}

export default function ChatPart({ youtubeId }: ChatPartProps) {
    const [active, setActive] = useState<"transcript">("transcript");
    const [activeN, setActiveN] = useState<"chat" | "summary" | "notes">("chat");
    const [category, setCategory] = useState("General");

    const [transcriptData, setTranscriptData] = useState<{content: string, chunks: string} | null>(null);
    const [isTimestampMode, setIsTimestampMode] = useState(false);
    const [dbId, setDbId] = useState<number | null>(null);

    const [isScrollDirectionDown, setIsScrollDirectionDown] = useState(true);

    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const editorRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const transcriptScrollRef = useRef<HTMLDivElement>(null);

    const currentYoutubeId = youtubeId || "T7ZKNoB98ok";

    // Функция для заголовков (исправленная для билда)
    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`,
        };
    };

    // Синхронизация с БД (Личная библиотека пользователя)
    useEffect(() => {
        const syncVideoWithDb = async () => {
            try {
                // Шлем запрос на добавление видео в библиотеку юзера
                const response = await fetch(`/api/videos/add?url=${currentYoutubeId}&category=${encodeURIComponent(category)}`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json(); // Теперь получаем UserVideo
                    // Извлекаем id именно сущности Video для работы с транскриптом
                    if (data && data.video && data.video.id) {
                        setDbId(data.video.id);
                    }
                }
            } catch (error) {
                console.error("Ошибка синхронизации:", error);
            }
        };

        if (currentYoutubeId) {
            setTranscriptData(null);
            setDbId(null);
            setMessages([]);
            syncVideoWithDb();
        }
    }, [currentYoutubeId]);

    // Загрузка транскрипта по dbId
    useEffect(() => {
        let timer: NodeJS.Timeout;

        const fetchTranscript = async () => {
            if (!dbId) return;
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(`/api/transcripts/${dbId}/full`, {
                    method: 'GET',
                     headers: getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    setTranscriptData(data);
                } else if (response.status === 404) {
                    // Если транскрипт еще не готов (в процессе парсинга), опрашиваем снова
                    timer = setTimeout(fetchTranscript, 2000);
                }
            } catch (error) {
                console.error("Ошибка загрузки транскрипта:", error);
            }
        };

        fetchTranscript();
        return () => clearTimeout(timer);
    }, [dbId]);

    // Автоскролл чата при новых сообщениях
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Логика мягкого скролла транскрипта
    const slowScrollTo = (target: number) => {
        const container = transcriptScrollRef.current;
        if (!container) return;

        const start = container.scrollTop;
        const change = target - start;
        const duration = 1200;
        let startTime: number | null = null;

        const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
            t /= d / 2;
            if (t < 1) return (c / 2) * t * t + b;
            t--;
            return (-c / 2) * (t * (t - 2) - 1) + b;
        };

        const animateScroll = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const progress = currentTime - startTime;
            const val = easeInOutQuad(progress, start, change, duration);
            container.scrollTop = val;

            if (progress < duration) {
                requestAnimationFrame(animateScroll);
            } else {
                container.scrollTop = target;
            }
        };
        requestAnimationFrame(animateScroll);
    };

    const handleToggleScroll = () => {
        if (!transcriptScrollRef.current) return;
        const container = transcriptScrollRef.current;
        if (isScrollDirectionDown) {
            slowScrollTo(container.scrollHeight);
        } else {
            slowScrollTo(0);
        }
        setIsScrollDirectionDown(!isScrollDirectionDown);
    };

    // Рендер таймкодов
    const renderChunks = () => {
        if (!transcriptData?.chunks) return <div style={{color: '#000'}}>Таймкодов нет в БД</div>;

        try {
            let parsed = typeof transcriptData.chunks === 'string' ? JSON.parse(transcriptData.chunks) : transcriptData.chunks;
            if (Array.isArray(parsed) && Array.isArray(parsed[0])) parsed = parsed[0];
            if (!Array.isArray(parsed)) return <div style={{color: '#000'}}>Ошибка: Данные не в виде массива</div>;

            return parsed.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#007AFF', fontWeight: 'bold', minWidth: '45px' }}>
                        {Math.floor(item.start / 60)}:{(Math.floor(item.start % 60)).toString().padStart(2, '0')}
                    </span>
                    <span style={{ color: '#000' }}>{item.text}</span>
                </div>
            ));
        } catch (e) {
            return <div style={{color: '#000'}}>Ошибка отображения таймкодов</div>;
        }
    };

    // Отправка сообщений в AI чат
    const handleSendMessage = async () => {
         const token = localStorage.getItem("token");
        const text = editorRef.current?.innerText.trim();
        if (!text || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        if (editorRef.current) editorRef.current.innerText = "";
        setIsLoading(true);

        try {
            const response = await fetch(`/api/v1/ai/ask?prompt=${encodeURIComponent(text)}&videoId=${currentYoutubeId}`, {
                method: 'GET',
                 headers: getAuthHeaders()
            });
            if (response.ok) {
                const aiResponse = await response.text();
                setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Получение саммари
    const handleGetSummary = async () => {
        const textToSummarize = transcriptData?.content || "Текст еще не загружен";
        setIsLoading(true);
        setActiveN("summary");
        try {
            const response = await fetch(`/api/v1/ai/summary`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ text: textToSummarize, videoId: currentYoutubeId })
            });
            if (response.ok) {
                const summaryResponse = await response.text();
                setMessages(prev => [...prev, { role: 'ai', text: "📝 SUMMARY:\n\n" + summaryResponse }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.leftPart}>
                <div className={classes.videoCont}>
                    <iframe
                        key={currentYoutubeId}
                        className={classes.video}
                        src={`https://www.youtube.com/embed/${currentYoutubeId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
                <div className={classes.AboutMCont}>
                    <div className={classes.aboutNav}>
                        <div className={classes.aboutNavL}>
                            <div
                                className={`${classes.transcript} ${!isTimestampMode ? classes.active : ""}`}
                                onClick={() => setIsTimestampMode(false)}
                            >
                                <div className={classes.icon} />
                                <p className={classes.Name}>Transcript</p>
                            </div>
                            <div
                                className={`${classes.transcript} ${isTimestampMode ? classes.active : ""}`}
                                onClick={() => setIsTimestampMode(true)}
                            >
                                <div className={classes.icon} />
                                <p className={classes.Name}>Timestamps</p>
                            </div>
                        </div>
                        <div className={classes.aboutNavR}>
                            <div
                                className={classes.autoScrollButton}
                                onClick={handleToggleScroll}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={classes.arrows} />
                                {isScrollDirectionDown ? "Scroll Down" : "Scroll Up"}
                            </div>
                        </div>
                    </div>
                    <div className={classes.aboutScroller} ref={transcriptScrollRef} style={{ overflowY: 'auto' }}>
                        <div style={{ padding: '10px' }}>
                            {isTimestampMode ? renderChunks() : (
                                <div className={classes.block}>
                                    <div className={classes.blockText} style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#000' }}>
                                        {transcriptData?.content || "Загрузка транскрипта..."}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={classes.rightPart}>
                <div className={classes.navbar}>
                    <div className={`${classes.chat} ${activeN === "chat" ? classes.activeN : ""}`} onClick={() => setActiveN("chat")}>
                        <div className={classes.icon} />Chat
                    </div>
                    <div className={`${classes.summary} ${activeN === "summary" ? classes.activeN : ""}`} onClick={handleGetSummary}>
                        <div className={classes.icon} />Summary
                    </div>
                </div>

                <div className={classes.backt} style={{ height: '70%', overflow: 'hidden' }}>
                    <div ref={scrollRef} style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.length === 0 ? (
                            <div className={classes.backtCont} style={{ marginTop: '20%' }}>
                                <div className={classes.logo}></div>
                                <div className={classes.title}><p className={classes.name}>StudyTube AI</p></div>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '15px',
                                        fontSize: '14px',
                                        background: m.role === 'user' ? '#007AFF' : '#E9E9EB',
                                        color: m.role === 'user' ? '#fff' : '#000',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && <p style={{ fontSize: '12px', color: '#8e8e93', marginLeft: '10px' }}>AI думает...</p>}
                    </div>
                </div>

                <div className={classes.inputCont}>
                    <div className={classes.editorWrapper}>
                        <div
                            ref={editorRef}
                            className={classes.editor}
                            contentEditable
                            role="textbox"
                            data-placeholder="Спроси что-нибудь..."
                            suppressContentEditableWarning
                            onKeyDown={onKeyDown}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}