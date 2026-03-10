"use client";
import { useEffect, useState } from "react";
import classes from "./UserSetModal.module.scss";
import { getUserFromToken } from "@/utils/getUserFromToken";

interface UserSetModalProps {
  onClose: () => void;
}

export default function UserSetModal({ onClose }: UserSetModalProps) {
  const [userName, setUserName] = useState<string>("Loading...");

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить аккаунт? Все ваши видео и данные будут стерты навсегда!"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/user/me", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Ошибка при удалении аккаунта");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  useEffect(() => {
    setUserName(getUserFromToken());
  }, []);

  return (
    <div className={classes.backdrop} onClick={onClose}>
      <div className={classes.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <h2>Settings</h2>
          <button className={classes.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={classes.content}>
          <div className={classes.userProfile}>
            <div className={classes.avatar}>
              <img src="https://ui-avatars.com/api/?name=${userName}&background=random" alt="Avatar" />
            </div>
            <div className={classes.info}>
              <p className={classes.label}>Account</p>
              <h3 className={classes.userName}>{userName}</h3>
            </div>
          </div>

          <div className={classes.actions}>
            <button
              className={classes.deleteBtn}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}