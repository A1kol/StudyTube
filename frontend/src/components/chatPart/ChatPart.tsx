'use client'
import classes from "./ChatPart.module.scss"
import { useState } from "react"

export default function ChatPart() {
    const [active, setActive] = useState<"chapters" | "transcript">("chapters");
    const [activeN, setActiveN] = useState<"chat" | "summary" | "notes">("chat");

    return(
        <>
            <div className={classes.wrapper}>
                <div className={classes.leftPart}>
                    <div className={classes.videoCont}>
                        <iframe 
                            className={classes.video}
                            src="https://www.youtube.com/embed/T7ZKNoB98ok" 
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                         />
                    </div>
                    <div className={classes.AboutMCont}>
                        <div className={classes.aboutNav}>
                            <div className={classes.aboutNavL}>
                                <div
                                    className={`${classes.chapters} ${
                                    active === "chapters" ? classes.active : ""
                                    }`}
                                    onClick={() => setActive("chapters")}
                                >
                                    <div className={classes.icon} />
                                    <p className={classes.Name}>Chapters</p>
                                </div>

                                <div
                                    className={`${classes.transcript} ${
                                    active === "transcript" ? classes.active : ""
                                    }`}
                                    onClick={() => setActive("transcript")}
                                >
                                    <div className={classes.icon} />
                                    <p className={classes.Name}>Transcript</p>
                                </div>
                            </div>
                            <div className={classes.aboutNavR}>
                                <div className={classes.autoScrollButton}><div className={classes.arrows} />Auto Scroll</div>
                                <div className={classes.closeArrow}> 
                                    <div className={classes.arrow}></div>
                                </div>
                            </div>
                        </div>
                        <div className={classes.aboutScroller}>
                            <div className={classes.block}>
                                <div className={classes.time}>##:##</div>
                                <div className={classes.blockTitle}>Game Introduction</div>
                                <div className={classes.blockText}>In today's gameplay video, the presenter humorously shifts between discussing health and video games, particularly highlighting the new Call of Duty set in World War II, while engaging viewers in light-hearted banter about finding hidden elements in the game. Additionally, there is a mention of previous horror-themed content, indicating a diverse range of topics covered in the channel.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={classes.rightPart}>
                    <div className={classes.navbar}>
                        <div
                            className={`${classes.chat} ${activeN === "chat" ? classes.activeN : ""}`}
                            onClick={() => setActiveN("chat")}
                        >
                            <div className={classes.icon} />
                            Chat
                        </div>

                        <div
                            className={`${classes.summary} ${
                            activeN === "summary" ? classes.activeN : ""
                            }`}
                            onClick={() => setActiveN("summary")}
                        >
                            <div className={classes.icon} />
                            Summary
                        </div>

                        <div
                            className={`${classes.notes} ${
                            activeN === "notes" ? classes.activeN : ""
                            }`}
                            onClick={() => setActiveN("notes")}
                        >
                            <div className={classes.icon} />
                            Notes
                        </div>
                    </div>
                    <div className={classes.backt}>
                        <div className={classes.backtCont}>
                            <div className={classes.logo}>

                            </div>
                            <div className={classes.title}>
                                <p className={classes.name}>Learn with Studai</p>
                            </div>
                        </div>
                    </div>
                    <div className={classes.inputCont}>
                        <div className={classes.editorWrapper}>
                            <div
                                className={classes.editor}
                                contentEditable
                                role="textbox"
                                spellCheck={true}
                                data-placeholder="Learn anything"
                                suppressContentEditableWarning
                            ></div>
                        </div>
                    </div>
                </div>
            </div> 
        </>
    )
}