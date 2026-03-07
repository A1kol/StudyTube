'use client'
import classes from "./ChatPart.module.scss"
import { useState, useRef, useEffect } from "react"

interface ChatPartProps {
    youtubeId?: string;
    videoUrl?: string;
}

export default function ChatPart({ youtubeId }: ChatPartProps) {
    const [activeN, setActiveN] = useState<"chat" | "summary" | "notes">("chat");
    const [category, setCategory] = useState("");
    const [summaryText, setSummaryText] = useState<string>("");
    const [notesText, setNotesText] = useState<string>("");
    const [scrollSpeed, setScrollSpeed] = useState(1200);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const [transcriptData, setTranscriptData] = useState<{content: string, chunks: string} | null>(null);
    const [isTimestampMode, setIsTimestampMode] = useState(false);
    const [dbId, setDbId] = useState<number | null>(null);
    const [isScrollDirectionDown, setIsScrollDirectionDown] = useState(true);
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const animationRef = useRef<number | null>(null);
    const directionRef = useRef<"down" | "up" | null>(null);

    const editorRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const transcriptScrollRef = useRef<HTMLDivElement>(null);

    const currentYoutubeId = youtubeId;

    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "text/plain"
        };
    };

    useEffect(() => {
        const syncVideoWithDb = async () => {
            try {
                const response = await fetch(`/api/videos/add?url=${currentYoutubeId}&category=${encodeURIComponent(category)}`, {
                    method: 'POST',
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data?.video?.id) setDbId(data.video.id);
                }
            } catch (error) { console.error("Ошибка синхронизации:", error); }
        };

        if (currentYoutubeId) {
            setTranscriptData(null);
            setDbId(null);
            setMessages([]);
            setSummaryText("");
            syncVideoWithDb();
        }
    }, [currentYoutubeId]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        const fetchTranscript = async () => {
            if (!dbId) return;
            try {
                const response = await fetch(`/api/transcripts/${dbId}/full`, {
                    method: 'GET',
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTranscriptData(data);
                } else if (response.status === 404) {
                    timer = setTimeout(fetchTranscript, 2000);
                }
            } catch (error) { console.error("Ошибка загрузки:", error); }
        };
        fetchTranscript();
        return () => clearTimeout(timer);
    }, [dbId]);

    // --- ФУНКЦИИ СКРОЛЛА И РЕНДЕРА ТАЙМКОДОВ ---
const slowScrollTo = (target: number, direction: "down" | "up") => {
  const container = transcriptScrollRef.current;
  if (!container) return;

  // Остановка прошлой анимации перед запуском новой
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }

  directionRef.current = direction;

  const start = container.scrollTop;
  const distance = target - start;
  
  // Рассчитываем длительность исходя из текущего стейта scrollSpeed
  // scrollSpeed здесь — это пиксели в секунду
  const duration = (Math.abs(distance) / scrollSpeed) * 1000;

  let startTime: number | null = null;

  const animateScroll = (time: number) => {
    if (startTime === null) startTime = time;

    const progress = time - startTime;
    const percent = Math.min(progress / duration, 1);

    // Ease-out эффект можно убрать для линейного "автоскролла", 
    // но для ручного запуска оставим плавность
    container.scrollTop = start + distance * percent;

    if (percent < 1 && directionRef.current === direction) {
      animationRef.current = requestAnimationFrame(animateScroll);
    } else {
      directionRef.current = null;
      animationRef.current = null;
    }
  };

  animationRef.current = requestAnimationFrame(animateScroll);
};

const handleToggleScroll = () => {
  const container = transcriptScrollRef.current;
  if (!container) return;

  // Если анимация уже идет — останавливаем
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    directionRef.current = null;
    return;
  }

  // Запуск скролла в зависимости от текущего стейта направления
  if (isScrollDirectionDown) {
    slowScrollTo(container.scrollHeight, "down");
  } else {
    slowScrollTo(0, "up");
  }

  // Инвертируем направление для следующего клика
  setIsScrollDirectionDown(prev => !prev);
};

// Ручной скролл не меняет направление кнопки
useEffect(() => {
  const container = transcriptScrollRef.current;
  if (!container) return;

  const stopScroll = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      directionRef.current = null;
    }
  };

  container.addEventListener("wheel", stopScroll);
  container.addEventListener("touchmove", stopScroll);

  return () => {
    container.removeEventListener("wheel", stopScroll);
    container.removeEventListener("touchmove", stopScroll);
  };
}, []);

const changeSpeed = (speed: number) => {
  setScrollSpeed(speed);
  setShowSpeedMenu(false);

  // Если в данный момент идет скролл, перезапускаем его с новой скоростью
  if (directionRef.current) {
    const container = transcriptScrollRef.current;
    if (!container) return;
    
    const target = directionRef.current === "down" ? container.scrollHeight : 0;
    slowScrollTo(target, directionRef.current);
  }
};


    const renderChunks = () => {
        if (!transcriptData?.chunks) return <div style={{color: '#000'}}>Таймкодов нет</div>;
        try {
            let parsed = typeof transcriptData.chunks === 'string' ? JSON.parse(transcriptData.chunks) : transcriptData.chunks;
            if (Array.isArray(parsed) && Array.isArray(parsed[0])) parsed = parsed[0];
            return parsed.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#007AFF', fontWeight: 'bold', minWidth: '45px' }}>
                        {Math.floor(item.start / 60)}:{(Math.floor(item.start % 60)).toString().padStart(2, '0')}
                    </span>
                    <span style={{ color: '#000', fontSize: '14px' }}>{item.text}</span>
                </div>
            ));
        } catch (e) { return <div style={{color: '#000'}}>Ошибка отображения</div>; }
    };

    // --- ОБРАБОТКА СООБЩЕНИЙ И САММАРИ ---
    const handleSendMessage = async () => {
        const text = editorRef.current?.innerText.trim();
        if (!text || isLoading) return;
        setMessages(prev => [...prev, { role: 'user', text }]);
        if (editorRef.current) editorRef.current.innerText = "";
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/ai/ask?prompt=${encodeURIComponent(text)}&videoId=${currentYoutubeId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const aiResponse = await response.text();
                setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };


const handleGetSummary = async () => {
    if ((summaryText && !isLoading) || !currentYoutubeId) {
        setActiveN("summary");
        return;
    }

    setIsLoading(true);
    setActiveN("summary");
    setSummaryText("");

    try {
        const response = await fetch(`/api/v1/ai/summary?videoId=${currentYoutubeId}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (response.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });

            // Оптимизированный парсинг SSE
            const lines = chunk.split("\n");
            lines.forEach(line => {
                if (line.startsWith("data:")) {
                    const content = line.replace("data:", "");
                    // Игнорируем техническое сообщение [DONE] если оно есть
                    if (content.trim() !== "[DONE]") {
                        setSummaryText(prev => prev + content);
                    }
                } else if (line.trim() && !line.startsWith("data:")) {
                    // Fallback для чистого текста
                    setSummaryText(prev => prev + line);
                }
            });
        }
    } catch (error) {
        console.error("Summary fetch error:", error);
        setSummaryText(prev => prev.length > 0 ? prev : "Ошибка при генерации конспекта.");
    } finally {
        setIsLoading(false);
    }
};

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, summaryText, isLoading]);

    useEffect(() => {
  const container = transcriptScrollRef.current;
  if (!container) return;

const stopScroll = () => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    directionRef.current = null;
  }
};

  container.addEventListener("wheel", stopScroll);
  container.addEventListener("touchmove", stopScroll);

  return () => {
    container.removeEventListener("wheel", stopScroll);
    container.removeEventListener("touchmove", stopScroll);
  };
}, []);

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
                    <iframe key={currentYoutubeId} className={classes.video} src={`https://www.youtube.com/embed/${currentYoutubeId}`} title="Player" frameBorder="0" allowFullScreen />
                </div>
                <div className={classes.AboutMCont}>
                    <div className={classes.aboutNav}>
                        <div className={classes.aboutNavL}>
                            <div className={`${classes.transcript} ${!isTimestampMode ? classes.active : ""}`} onClick={() => setIsTimestampMode(false)}>
                                <div className={classes.icon} /><p className={classes.Name}>Transcript</p>
                            </div>
                            <div className={`${classes.transcript} ${isTimestampMode ? classes.active : ""}`} onClick={() => setIsTimestampMode(true)}>
                                <div className={classes.icon} /><p className={classes.Name}>Timestamps</p>
                            </div>
                        </div>
                        <div className={classes.aboutNavR}>
                            <div className={classes.autoScrollWrapper} style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
                                
                                {/* Кнопка Старт/Стоп */}
                                <div
                                    className={classes.autoScrollButton}
                                    onClick={handleToggleScroll}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <div className={classes.arrows} />
                                    {/* Если скролл идет — пишем Stop, если нет — направление */}
                                    {directionRef.current 
                                        ? "Stop" 
                                        : (isScrollDirectionDown ? "Scroll Down" : "Scroll Up")
                                    }
                                </div>

                                {/* Выбор скорости */}
                                <div
                                    className={classes.speedToggle}
                                    onClick={() => setShowSpeedMenu(prev => !prev)}
                                    style={{ cursor: 'pointer', padding: '0 5px' }}
                                >
                                    {scrollSpeed === 40 ? "Slow" : scrollSpeed === 70 ? "Normal" : "Fast"} ▾
                                </div>

                                {showSpeedMenu && (
                                    <div className={classes.speedMenu} style={{
                                        position: 'absolute', top: '100%', right: 0, 
                                        background: '#fff', border: '1px solid #ddd', zIndex: 10,
                                        borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => changeSpeed(40)}>Slow</div>
                                        <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => changeSpeed(70)}>Normal</div>
                                        <div style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => changeSpeed(500)}>Fast</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={classes.aboutScroller} ref={transcriptScrollRef}>
                        <div style={{ padding: '15px' }}>
                            {isTimestampMode ? renderChunks() : (
                                <div style={{ color: '#000', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                    {transcriptData?.content || "Загрузка транскрипта..."}
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
                    <div className={`${classes.notes} ${activeN === "notes" ? classes.activeN : ""}`} onClick={() => setActiveN("notes")}>
                        <div className={classes.icon} />Notes
                    </div>
                </div>

                <div className={classes.backt} style={{ flex: 1, overflow: 'hidden' }}>
                    <div ref={scrollRef} className="custom-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '15px' }}>
                        {activeN === 'chat' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {messages.length === 0 ? (
                                    <div className={classes.backtCont} style={{ alignSelf: 'center', marginTop: '20%' }}>
                                        <div className={classes.logo}></div>
                                        <div className={classes.title}><p className={classes.name}>StudyTube AI</p></div>
                                    </div>
                                ) : (
                                    messages.map((m, i) => (
                                        <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                            <div style={{
                                                padding: '10px 14px', borderRadius: '14px', fontSize: '14px',
                                                background: m.role === 'user' ? '#0f172a' : '#f1f5f9',
                                                color: m.role === 'user' ? '#fff' : '#000'
                                            }}>{m.text}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : activeN === 'summary' ? (
                            <div style={{ color: '#000' }}>
                                <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>📝 Summary</h3>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>{summaryText}</div>
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ color: '#000', marginBottom: '10px', fontSize: '18px' }}>📓 Notes</h3>
                                <textarea
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                    placeholder="Write your notes here..."
                                    style={{
                                        flex: 1, width: '100%', padding: '12px', borderRadius: '10px',
                                        border: '1px solid #e2e8f0', background: '#f8fafc',
                                        fontSize: '14px', resize: 'none', outline: 'none', color: '#000'
                                    }}
                                />
                            </div>
                        )}
                        {isLoading && activeN !== 'notes' && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>AI thinking...</p>}
                    </div>
                </div>

                {activeN === 'chat' && (
                    <div className={classes.inputCont}>
                        <div className={classes.editorWrapper}>
                            <div ref={editorRef} className={classes.editor} contentEditable role="textbox" data-placeholder="Ask anything..." onKeyDown={onKeyDown}></div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scroll::-webkit-scrollbar { width: 4px !important; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1 !important; border-radius: 10px !important; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent !important; }
            `}</style>
        </div>
    );
}