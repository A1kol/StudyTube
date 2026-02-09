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
          Log in with Google
        </button>
      </motion.div>
    </div>
  );
}