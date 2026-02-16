"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import classes from "./loginPage.module.scss";
import { motion, AnimatePresence } from "framer-motion";

export default function LogIn() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/auth";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isLogin
        ? `${API_URL}/login`
        : `${API_URL}/register`;

      const body = isLogin
        ? { name, password }
        : { name, password, mail: email };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json(); // парсим JSON ответа
        throw new Error(data.error || "Auth error");
      }


      if (isLogin) {
        const data = await res.json(); // AuthResponseDTO
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);
        router.push("/");
      } else {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);
        router.push("/");
      }
    } catch (err: any) {
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
          <div
            className={`${classes.slider} ${
              !isLogin ? classes.slideRight : ""
            }`}
          />
          <button
            className={`${classes.toggleBtn} ${
              isLogin ? classes.activeTab : ""
            }`}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Log in
          </button>
          <button
            className={`${classes.toggleBtn} ${
              !isLogin ? classes.activeTab : ""
            }`}
            onClick={() => setIsLogin(false)}
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
                    ? "Продолжайте ваш путь к знаниям"
                    : "Создайте аккаунт, чтобы получить доступ к курсам"}
                </p>
              </div>

              <form className={classes.form} onSubmit={handleSubmit}>
                <div className={classes.inputGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className={classes.inputGroup}>
                    <label>Mail</label>
                    <input
                      type="email"
                      placeholder="example@edu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

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

                {error && (
                  <p style={{ color: "#ff6b6b", fontSize: 14 }}>{error}</p>
                )}

                <button
                  type="submit"
                  className={classes.mainBtn}
                  disabled={loading}
                >
                  {loading
                    ? "Загрузка..."
                    : isLogin
                    ? "Войти в систему"
                    : "Зарегистрироваться"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={classes.divider}>
          <span>OR</span>
        </div>

        <button className={classes.googleBtn} type="button">
          Log in with Google
        </button>
      </motion.div>
    </div>
  );
}
