"use client";
import { useEffect, useState } from "react";
import classes from "./UserSetModal.module.scss";
import { getUserFromToken } from "@/utils/getUserFromToken";

interface UserSetModalProps {
  onClose: () => void;
}

export default function UserSetModal({ onClose }: UserSetModalProps) {
  const [userName, setUserName] = useState<string>("Loading...");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- ФУНКЦИЯ СМЕНЫ ПАРОЛЯ ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        alert("Пароль успешно обновлен!");
        setNewPassword("");
      } else {
        alert("Ошибка при обновлении пароля");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {

    const confirmDelete = window.confirm(
      "Вы уверены, что хотите удалить аккаунт?"
    )

    if (!confirmDelete) return

    const token = localStorage.getItem("token")
    const user = getUserFromToken()

    try {

      const response = await fetch("/api/user/me", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {

        if (user) {
          localStorage.removeItem(`studai_history_${user}`)
        }

        localStorage.removeItem("token")
        localStorage.removeItem("username")

        window.location.href = "/login"

      }

    } catch (error) {

      console.error(error)

    }

  }
  
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
          {/* Блок Профиля */}
          <div className={classes.userProfile}>
            <div className={classes.avatar}>
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=random`} alt="Avatar" />
            </div>
            <div className={classes.info}>
              <p className={classes.label}>Account</p>
              <h3 className={classes.userName}>{userName}</h3>
            </div>
          </div>

          <hr className={classes.divider} />

          {/* Секция безопасности */}
          <div className={classes.passwordSection}>
            <h4>Security</h4>
            <form className={classes.inputGroup} onSubmit={handleUpdatePassword}>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="submit"
                className={classes.saveBtn}
                disabled={isUpdating || !newPassword}
              >
                {isUpdating ? "..." : "Update"}
              </button>
            </form>
            <p className={classes.hint}>Set a password to log in without Google</p>
          </div>

          {/* Опасная зона */}
          <div className={classes.actions}>
            <button className={classes.deleteBtn} onClick={handleDeleteAccount}>
              Delete account and data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}