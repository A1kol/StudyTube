"use client";
import classes from "./UserSet.module.scss";

interface UserSetModalProps {
  onClose: () => void;
}

export default function UserSetModal({ onClose }: UserSetModalProps) {
  return (
    <div className={classes.backdrop} onClick={onClose}>
      <div className={classes.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <h2>Settings</h2>
          <button className={classes.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <div className={classes.content}>
          <div className={classes.userProfile}>
            <div className={classes.avatar}>
              <img src="https://lh3.googleusercontent.com/a/ACg8ocKMeWGFRPZyCAByPwWqRT1jL9b0ftQZ4LFguAxumFsbpYSrxAsm=s96-c" alt="Avatar" />
            </div>
            <div className={classes.info}>
              <p className={classes.label}>Account</p>
              <h3 className={classes.userName}>Алихан Искендербеков</h3>
            </div>
          </div>
          
          {/* Здесь можно добавить другие настройки в будущем */}
        </div>
      </div>
    </div>
  );
}