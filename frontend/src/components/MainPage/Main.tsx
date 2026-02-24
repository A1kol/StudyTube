'use client';
import { useState, useEffect } from "react";
import classes from "./Main.module.scss";
import Header from "../Header/Header";
import LeftBar from "../LeftBar/LeftBar";
import ChatPart from "../chatPart/ChatPart";
import { useRouter } from "next/navigation";

export default function Main() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            // Если токена нет, кидаем на страницу логина
            router.push("/login"); 
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    // Пока идет проверка, лучше ничего не рендерить или показать спиннер
    if (!isAuthorized) {
        return null; // или <div className={classes.loader}>Loading...</div>
    }

    const [currentVideo, setCurrentVideo] = useState({
        title: "Introduction to StudyAI",
        youtubeId: "T7ZKNoB98ok"
    });

    const handleVideoChange = (data: any) => {
        console.log("Main: Данные получены", data);
        if (!data) return;

        const videoInfo = data.video ? data.video : data;

        setCurrentVideo({
            title: videoInfo.title || "Untitled Video",
            youtubeId: videoInfo.youtubeId || ""
        });
    };

    return (
        <div className={classes.wrapper}>
            <LeftBar
                isOpen={isOpen}
                onVideoSelect={handleVideoChange}
            />

            <div className={`${classes.content} ${isOpen ? classes.shifted : ""}`}>
                <Header
                    isOpen={isOpen}
                    toggle={() => setIsOpen(p => !p)}
                    videoTitle={currentVideo.title}
                />

                <ChatPart
                    key={currentVideo.youtubeId}
                    youtubeId={currentVideo.youtubeId}
                />
            </div>
        </div>
    );
}