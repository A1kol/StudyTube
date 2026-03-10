"use client";

import React, { useState, useEffect } from "react"; // Добавили useEffect
import { useRouter } from "next/navigation";
import classes from "./loginPage.module.scss";
import { motion, AnimatePresence } from "framer-motion";

export default function LogIn() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "/api/auth";

  // --- ЭТОТ БЛОК НУЖНО ДОБАВИТЬ ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const errorParam = params.get("error");

    if (token) {
      // Сохраняем данные
      localStorage.setItem("token", token);
      localStorage.setItem("username", name ? decodeURIComponent(name) : "User");

      // Убираем параметры из URL для чистоты
      window.history.replaceState({}, document.title, window.location.pathname);

      // Редирект на главную
      router.push("/");
      router.refresh();
    } else if (errorParam) {
      setError("Ошибка входа через Google. Попробуйте снова.");
    }
  }, [router]);

  const handleGoogleLogin = () => {
    // Просто перенаправляем на эндпоинт Spring Security
    window.location.href = "/api/oauth2/authorization/google";
  };
  // -------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      const body = isLogin
        ? { mail, password }
        : { name, password, mail };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

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

      const contentType = res.headers.get("content-type");
      const data = (contentType && contentType.includes("application/json"))
        ? await res.json()
        : null;

      if (isLogin) {
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.name || "User");
          router.push("/");
          router.refresh();
        }
      } else {
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
      {/* ... твой декор ... */}
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
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
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

        <button
          className={classes.googleBtn}
          type="button"
          onClick={handleGoogleLogin}
        >

          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}