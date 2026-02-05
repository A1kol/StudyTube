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
                                <div className={classes.autoScrollButton}>Auto Scroll</div>
                                <div className={classes.closeArrow}> 
                                    <div className={classes.arrow}></div>
                                </div>
                            </div>
                        </div>
                        <div className={classes.aboutScroller}></div>
                    </div>
                </div>
                <div className={classes.rightPart}>

                </div>
            </div> 
        </>
    )
}