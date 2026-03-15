"use client";
import classes from "./Header.module.scss";

type HeaderProps = {
    isOpen: boolean;
    toggle: () => void;
    videoTitle?: string;
    youtubeId?: string;
};

export default function Header({ isOpen, toggle, videoTitle, youtubeId }: HeaderProps) {

    const handleShare = async () => {
        if (!youtubeId) return;

        const shareUrl = `${window.location.origin}?video=${youtubeId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Share link copied!");
        } catch {
            prompt("Copy this link:", shareUrl);
        }
    };


    return (
        <div className={classes.wrapper}>
            <div className={classes.insideWrapper}>
                <div className={classes.leftPart}>
                    <div className={classes.nav}>
                        <div
                            className={`${classes.burgerMenu} ${
                                isOpen ? classes.active : ""
                            }`}
                            onClick={toggle}
                        >
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>

                    <div className={classes.videoNameContainer}>
                        <p className={classes.videoName}>
                            {videoTitle || "Untitled Video"}
                        </p>
                    </div>
                </div>

                <div className={classes.rightPart}>
                    <div className={classes.actions}>
                        <button className={classes.shareButton} onClick={handleShare}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ marginRight: '8px' }}
                            >
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}