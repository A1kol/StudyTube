'use client';
import { useState } from "react";
import classes from "./Main.module.scss";
import Header from "../Header/Header";
import LeftBar from "../LeftBar/LeftBar";
import ChatPart from "../chatPart/ChatPart";

export default function Main() {
    const [isOpen, setIsOpen] = useState(false);

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