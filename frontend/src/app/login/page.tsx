"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import classes from "./loginPage.module.scss"
import { motion, AnimatePresence } from "framer-motion";

export default function LogIn() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formVariants = {
    initial: (isLogin: boolean) => ({
      x: isLogin ? 50 : -50,
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (isLogin: boolean) => ({
      x: isLogin ? -50 : 50,
      opacity: 0,
    }),
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
            onClick={() => setIsLogin(true)}
          >
            Log in
          </button>
          <button 
            className={`${classes.toggleBtn} ${!isLogin ? classes.activeTab : ""}`}
            onClick={() => setIsLogin(false)}
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
                <p>{isLogin ? "Продолжайте ваш путь к знаниям" : "Создайте аккаунт, чтобы получить доступ к курсам"}</p>
              </div>

              <form className={classes.form} onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={classes.inputGroup}
                  >
                    <label>Fullname</label>
                    <input 
                      type="text" 
                      placeholder="Александр Иванов" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                )}
                
                <div className={classes.inputGroup}>
                  <label>Mail</label>
                  <input type="email" placeholder="example@edu.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className={classes.inputGroup}>
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" className={classes.mainBtn}>
                  {isLogin ? "Войти в систему" : "Зарегистрироваться"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={classes.divider}><span>OR</span></div>
        <button className={classes.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Log in with Google
        </button>
      </motion.div>
    </div>
  );
}