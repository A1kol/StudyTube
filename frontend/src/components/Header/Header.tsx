import classes from "./Header.module.scss";

type HeaderProps = {
    isOpen: boolean;
    toggle: () => void;
};

export default function Header({ isOpen, toggle }: HeaderProps) {
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
                        <p className={classes.videoName}>loololoololo</p>
                    </div>
                </div>

                <div className={classes.rightPart}>
                    <button className={classes.shareButton}>Share</button>
                </div>
            </div>
        </div>
    );
}
