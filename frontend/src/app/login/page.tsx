"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const nameParam = params.get("name");
    const errorParam = params.get("error");

    if (token) {
      console.log("Next.js Page: Token found in URL, saving...");
      localStorage.setItem("token", token);
      localStorage.setItem("username", nameParam ? decodeURIComponent(nameParam) : "User");

      window.history.replaceState({}, document.title, window.location.pathname);
      router.push("/");
      router.refresh();
    } else if (errorParam) {
      setError("Ошибка входа через Google. Попробуйте снова.");
    }
  }, [router]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/oauth2/authorization/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Подготовка почты: если нет @, добавляем наш домен.
      // Это нужно и для логина, и для регистрации.
      const cleanInput = mail.trim();
      const finalMail = cleanInput.includes('@')
        ? cleanInput
        : `${cleanInput}@studytube.com`;

      console.log("Form submit. Mode:", isLogin ? "Login" : "Register");
      console.log("Target mail:", finalMail);

      const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
      const body = isLogin
        ? { mail: finalMail, password }
        : { name, password, mail: finalMail };

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

      if (isLogin) {
        // Логика LOGIN
        const data = await res.json();
        console.log("Login response data:", data);
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.name || "User");
          router.push("/");
          router.refresh();
        }
      } else {
        // Логика REGISTER -> Автологин
        console.log("Register success, starting autologin for:", finalMail);
        const loginRes = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail: finalMail, password }),
        });

        if (!loginRes.ok) throw new Error("Autologin failed after registration");

        const loginData = await loginRes.json();
        if (loginData.token) {
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("username", loginData.name || name || "User");
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error("Auth error trace:", err);
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
            onClick={() => { setIsLogin(true); setError(null); setMail(""); }}
            type="button"
          >
            Log in
          </button>
          <button
            className={`${classes.toggleBtn} ${!isLogin ? classes.activeTab : ""}`}
            onClick={() => { setIsLogin(false); setError(null); setMail(""); }}
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
                    ? "Введите вашу почту или логин для входа"
                    : "Создайте аккаунт в системе studytube"}
                </p>
              </div>

              <form className={classes.form} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className={classes.inputGroup}>
                    <label>Display Name</label>
                    <input
                      type="text"
                      placeholder="Alex Gold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={classes.inputGroup}>
                  <label>{isLogin ? "Mail / Login" : "Choose Login"}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text" // Оставляем text, чтобы не было конфликтов с валидацией email браузером
                      placeholder={isLogin ? "example@mail.com or username" : "username"}
                      value={mail}
                      onChange={(e) => {
                        const val = e.target.value;
                        // При регистрации запрещаем @, при логине разрешаем (для Google аккаунтов или админов)
                        setMail(isLogin ? val : val.split('@')[0]);
                      }}
                      style={{
                        paddingRight: isLogin ? '12px' : '130px',
                        width: '100%'
                      }}
                      required
                    />
                    {!isLogin && (
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        color: '#94a3b8',
                        pointerEvents: 'none',
                        fontSize: '14px',
                        fontWeight: 500
                      }}>
                        @studytube.com
                      </span>
                    )}
                  </div>
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.05 1.014 4.956L3.964 7.28c.708-2.127 2.692-3.711 5.036-3.711z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}