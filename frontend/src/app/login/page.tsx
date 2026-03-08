"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import classes from "./loginPage.module.scss";
import { motion, AnimatePresence } from "framer-motion";

export default function LogIn() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [name, setName] = useState("");
  const [mail, setMail] = useState(""); // Используем mail везде единообразно
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/auth";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;

      // Формируем тело запроса, используя ПРАВИЛЬНЫЕ имена стейтов
      const body = isLogin
        ? { mail, password }
        : { name, password, mail };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // 1. Проверка статуса
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: "Authentication failed" };
        }
        throw new Error(errorData.error || errorData.message || "Error");
      }

      // 2. Безопасный парсинг JSON
      const contentType = res.headers.get("content-type");
      const data = (contentType && contentType.includes("application/json"))
        ? await res.json()
        : null;

      // 3. Логика обработки успеха
      if (isLogin) {
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.name || "User");
          router.push("/");
          router.refresh(); // Чтобы обновить состояние сервера, если нужно
        }
      } else {
        // Успешная регистрация
        setIsLogin(true);
        setMail("");
        setPassword("");
        setName("");
        alert("Account created! Please log in.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.bgDecoration}>
        <div className={classes.circle1}></div>
        <div className={classes.circle2}></div>
      </div>

      <motion.div
        layout
        initial={{ borderRadius: 24 }}
        className={classes.loginCard}
      >
        <div className={classes.toggleContainer}>
          <div className={`${classes.slider} ${!isLogin ? classes.slideRight : ""}`} />
          <button
            className={`${classes.toggleBtn} ${isLogin ? classes.activeTab : ""}`}
            onClick={() => { setIsLogin(true); setError(null); }}
            type="button"
          >
            Log in
          </button>
          <button
            className={`${classes.toggleBtn} ${!isLogin ? classes.activeTab : ""}`}
            onClick={() => { setIsLogin(false); setError(null); }}
            type="button"
          >
            Sign up
          </button>
        </div>

        <div className={classes.overflowContainer}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={classes.formPage}
            >
              <div className={classes.header}>
                <h1>{isLogin ? "Welcome back" : "Start study"}</h1>
                <p>
                  {isLogin
                    ? "Введите вашу почту для входа в систему"
                    : "Создайте аккаунт, чтобы начать обучение"}
                </p>
              </div>

              <form className={classes.form} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className={classes.inputGroup}>
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="alex_gold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={classes.inputGroup}>
                  <label>Mail</label>
                  <input
                    type="email"
                    placeholder="example@study.tube"
                    value={mail} // ПОПРАВЛЕНО: было email
                    onChange={(e) => setMail(e.target.value)} // ПОПРАВЛЕНО: было setEmail
                    required
                  />
                </div>

                <div className={classes.inputGroup}>
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className={classes.errorText}>{error}</p>}

                <button type="submit" className={classes.mainBtn} disabled={loading}>
                  {loading ? "Processing..." : isLogin ? "Войти в аккаунт" : "Зарегистрироваться"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={classes.divider}><span>OR</span></div>
        <button className={classes.googleBtn} type="button">Continue with Google</button>
      </motion.div>
    </div>
  );
}