'use client';
import { useState } from "react";
import classes from "./Main.module.scss";
import Header from "../Header/Header";
import LeftBar from "../LeftBar/LeftBar";
import ChatPart from "../chatPart/ChatPart";
import AddContentModal from "../addContentModal/AddContentModal";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Main() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const video = params.get("video");

        if (video) {
            setCurrentVideo({
                title: "Loading...",
                youtubeId: video
            });
        }
    }, []);

    const [currentVideo, setCurrentVideo] = useState<{
        title: string;
        youtubeId?: string;
    }>({
        title: "",
        youtubeId: undefined
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

    

    const handleTitleFetched = (title: string) => {
        setCurrentVideo(prev => ({
            ...prev,
            title
        }));
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
                    youtubeId={currentVideo.youtubeId}
                />

                <ChatPart
                    key={currentVideo.youtubeId}
                    youtubeId={currentVideo.youtubeId}
                    onTitleFetched={handleTitleFetched}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                />
            </div>
            {isAddModalOpen && (
                <AddContentModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleVideoChange}
                />
            )}
        </div>
    );
}