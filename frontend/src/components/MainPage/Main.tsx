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

    return (
        <div className={classes.wrapper}>
            <LeftBar isOpen={isOpen} />

            <div className={`${classes.content} ${isOpen ? classes.shifted : ""}`}>
                <Header isOpen={isOpen} toggle={() => setIsOpen(p => !p)} />
                <ChatPart></ChatPart>
            </div>
        </div>
    );
}