'use client'
import classes from "./ChatPart.module.scss"
import { useState, useRef, useEffect } from "react"

export default function ChatPart() {
    const [active, setActive] = useState<"chapters" | "transcript">("chapters");
    const [activeN, setActiveN] = useState<"chat" | "summary" | "notes">("chat");

    // ЛОГИКА ЧАТА
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // В реальном приложении этот ID должен приходить из URL или пропсов
    const videoId = "T7ZKNoB98ok";

    // Автопрокрутка чата вниз
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ (с памятью Redis)
    const handleSendMessage = async () => {
        const text = editorRef.current?.innerText.trim();
        if (!text || isLoading) return;

        const userMsg = { role: 'user' as const, text };
        setMessages(prev => [...prev, userMsg]);

        if (editorRef.current) editorRef.current.innerText = "";
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const encodedPrompt = encodeURIComponent(text);

            // Добавили videoId в параметры, как прописали в контроллере
            const response = await fetch(`http://localhost/api/v1/ai/ask?prompt=${encodedPrompt}&videoId=${videoId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "text/plain"
                }
            });

            if (response.ok) {
                const aiResponse = await response.text();
                setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "Ошибка доступа. Проверь авторизацию." }]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Сервер недоступен." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ФУНКЦИЯ ГЕНЕРАЦИИ КОНСПЕКТА (Summary)
    const handleGetSummary = async () => {
        // Здесь мы берем транскрипт (пока заглушка, либо берем из стейта, если он у тебя есть)
        const transcriptText = "In today's gameplay video we will discuss...";

        setIsLoading(true);
        setActiveN("summary"); // Переключаем вкладку на Summary

        try {
            const token = localStorage.getItem("token");
            // Используем POST, как договорились для больших текстов
            const response = await fetch(`http://localhost/api/v1/ai/summary`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: transcriptText // Передаем текст в теле запроса
            });

            if (response.ok) {
                const summaryResponse = await response.text();
                setMessages(prev => [...prev, { role: 'ai', text: "SUMMARY:\n" + summaryResponse }]);
            }
        } catch (error) {
            console.error("Summary error:", error);
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

    return(
        <>
            <div className={classes.wrapper}>
                <div className={classes.leftPart}>
                    <div className={classes.videoCont}>
                        <iframe
                            className={classes.video}
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allowFullScreen
                         />
                    </div>
                    <div className={classes.AboutMCont}>
                        <div className={classes.aboutNav}>
                            <div className={classes.aboutNavL}>
                                <div className={`${classes.chapters} ${active === "chapters" ? classes.active : ""}`} onClick={() => setActive("chapters")}>
                                    <div className={classes.icon} />
                                    <p className={classes.Name}>Chapters</p>
                                </div>
                                <div className={`${classes.transcript} ${active === "transcript" ? classes.active : ""}`} onClick={() => setActive("transcript")}>
                                    <div className={classes.icon} />
                                    <p className={classes.Name}>Transcript</p>
                                </div>
                            </div>
                            <div className={classes.aboutNavR}>
                                <div className={classes.autoScrollButton}><div className={classes.arrows} />Auto Scroll</div>
                                <div className={classes.closeArrow}><div className={classes.arrow}></div></div>
                            </div>
                        </div>
                        <div className={classes.aboutScroller}>
                            <div className={classes.block}>
                                <div className={classes.time}>##:##</div>
                                <div className={classes.blockTitle}>Game Introduction</div>
                                <div className={classes.blockText}>In today's gameplay video...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={classes.rightPart}>
                    <div className={classes.navbar}>
                        <div className={`${classes.chat} ${activeN === "chat" ? classes.activeN : ""}`} onClick={() => setActiveN("chat")}>
                            <div className={classes.icon} />Chat
                        </div>
                        <div className={`${classes.summary} ${activeN === "summary" ? classes.activeN : ""}`} onClick={() => handleGetSummary()}>
                            <div className={classes.icon} />Summary
                        </div>
                        <div className={`${classes.notes} ${activeN === "notes" ? classes.activeN : ""}`} onClick={() => setActiveN("notes")}>
                            <div className={classes.icon} />Notes
                        </div>
                    </div>

                    {/* ОСНОВНАЯ ЧАСТЬ ЧАТА */}
                    <div className={classes.backt} style={{ height: '70%', justifyContent: 'flex-start', overflow: 'hidden' }}>
                        <div
                            ref={scrollRef}
                            style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                        >
                            {messages.length === 0 ? (
                                <div className={classes.backtCont} style={{ marginTop: '20%' }}>
                                    <div className={classes.logo}></div>
                                    <div className={classes.title}>
                                        <p className={classes.name}>Learn with StudyAI</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: '15px',
                                            fontSize: '14px',
                                            background: m.role === 'user' ? '#f0f0f0' : '#e2e8f0',
                                            color: '#000',
                                            border: m.role === 'user' ? '1px solid #d1d1d1' : 'none',
                                            whiteSpace: 'pre-wrap' // Чтобы конспект (summary) отображался красиво с переносами
                                        }}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && <p style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>AI is typing...</p>}
                        </div>
                    </div>

                    <div className={classes.inputCont}>
                        <div className={classes.editorWrapper}>
                            <div
                                ref={editorRef}
                                className={classes.editor}
                                contentEditable
                                role="textbox"
                                spellCheck={true}
                                data-placeholder="Learn anything"
                                suppressContentEditableWarning
                                onKeyDown={onKeyDown}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}