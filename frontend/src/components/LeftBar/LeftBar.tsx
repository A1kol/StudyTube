import classes from "./LeftBar.module.scss";


export default function LeftBar({ isOpen }: { isOpen: boolean }) {
    return (
        <div className={`${classes.wrapper} ${isOpen ? classes.open : ""}`}></div>
    );
}


