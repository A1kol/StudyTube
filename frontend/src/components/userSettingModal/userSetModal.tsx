"use client";
import { useEffect, useState } from "react";
import classes from "./UserSetModal.module.scss";

interface UserSetModalProps {
  onClose: () => void;
}

export default function UserSetModal({ onClose }: UserSetModalProps) {
  const [userName, setUserName] = useState<string>("Loading...");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Декодируем payload токена (средняя часть)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        // В твоем случае имя лежит в 'sub'
        setUserName(payload.sub || "User");
      } catch (e) {
        console.error("Ошибка парсинга токена", e);
        setUserName("User");
      }
    }
  }, []);

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