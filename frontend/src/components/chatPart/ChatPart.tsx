import classes from "./ChatPart.module.scss"


export default function ChatPart() {


    return(
        <>
            <div className={classes.wrapper}>
                <div className={classes.leftPart}>
                    <div className={classes.videoCont}>
                        <iframe 
                            className={classes.video}
                            src="https://www.youtube.com/embed/T7ZKNoB98ok?start=368" 
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                         />
                    </div>
                    <div className={classes.AboutMCont}>
                        <div className={classes.aboutNav}>
                            <div className={classes.aboutNavL}>
                                <div className={classes.chapters}>
                                    <div className={classes.icon1} />
                                    <p className={classes.Name}>Chapters</p>
                                </div>
                                <div className={classes.transcript}>
                                    <div className={classes.icon2} />
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
                    <div className={classes.navbar}></div>
                    <div className={classes.backt}></div>
                    <div className={classes.inputCont}></div>
                </div>
            </div> 
        </>
    )
}