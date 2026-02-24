"use client";
import classes from "./LeftBar.module.scss";
import { useState, useEffect, useRef } from "react";
import UserSetModal from "../userSettingModal/userSetModal";
import AddContentModal from "../addContentModal/AddContentModal";
import { useRouter } from "next/router";

interface LeftBarProps {
  isOpen: boolean;
  recentItemsFromBackend?: { id: string; title: string; url: string }[];
  onVideoSelect?: (videoData: any) => void;
}

export default function LeftBar({ isOpen, recentItemsFromBackend = [], onVideoSelect }: LeftBarProps) {
  
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [userName, setUserName] = useState<string>("Loading...");
  const [username, setUsername] = useState<string>("");

  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const [items, setItems] = useState(recentItemsFromBackend);

  useEffect(() => {
    setItems(recentItemsFromBackend);
  }, [recentItemsFromBackend]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

const handleAddVideo = async () => {
    if (!videoUrl.trim()) return;
    
    try {
        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        // Формируем URL с параметром. Важно использовать encodeURIComponent для ссылки!
        const apiUrl = `http://localhost:8080/api/videos/add?url=${encodeURIComponent(videoUrl.trim())}`;

        const response = await fetch(`http://localhost:8080/api/videos/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/x-www-form-urlencoded", // Для RequestParam
            },
            body: new URLSearchParams({ url: videoUrl.trim() }) // Отправляем как форму
        });

        console.log("Status Code:", response.status);

        if (response.status === 403) {
            console.error("Доступ запрещен (403). Проверь: 1. Валидность JWT. 2. Права пользователя (Role). 3. Настройку CORS на бэкенде.");
            alert("Ошибка 403: Недостаточно прав или сессия истекла");
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сервера: ${response.status} ${errorText}`);
        }

        const newVideo = await response.json();
        setItems(prev => [newVideo, ...prev]);
        setVideoUrl("");
        setIsAddModalOpen(false);

        router.push(`/?v=${newVideo.youtubeId}`);
    } catch (error) {
        console.error("Full Error Info:", error);
        alert(error instanceof Error ? error.message : "Неизвестная ошибка");
    } finally {
        setIsSubmitting(false);
    }
};
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Теперь принимаем весь объект (videoData) и прокидываем его дальше без потерь
  const handleAddContent = (videoData: any) => {
    console.log("New content added data:", videoData);
    if (onVideoSelect) {
      onVideoSelect(videoData);
    }
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className={`${classes.wrapper} ${isOpen ? classes.open : ""}`}>
        <div className={classes.topContent}>
          <div className={classes.barHeader}>
            <div className={classes.logo}></div>
            <div className={classes.title}>StudAI</div>
          </div>

          <div className={classes.mainButtons}>
            <div className={classes.navGroup}>
              <button className={classes.navItem} onClick={() => setIsAddModalOpen(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5" // Сделал чуть жирнее для видимости
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                </svg>
                <span>Add content</span>
              </button>

              <button className={classes.navItem}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                </svg>
                <span>Search</span>
              </button>

              <a href="#" className={classes.navItem}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M12 7v5l4 2"></path>
                </svg>
                <span>History</span>
              </a>
            </div>
          </div>

          <div className={classes.barNav}>
            <div className={classes.section}>
              <p className={classes.sectionTitle}>Spaces</p>
              <div className={classes.group}>
                <button className={classes.navButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.icon}>
                    <path d="M5 12h14M12 5v14"/>
                  </svg>
                  <span>Create Space</span>
                </button>
                <div className={`${classes.navButton} ${classes.activeSpace}`}>
                  <div className={classes.itemContent}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.icon}>
                      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/>
                    </svg>
                    <span className={classes.truncate}>{userName}'s Space</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.moreIcon}>
                    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className={classes.section}>
              <p className={classes.sectionTitle}>Recents</p>
              <div className={classes.group}>
                {items && items.length > 0 ? (
                  items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveId(item.id);
                          if (onVideoSelect) onVideoSelect(item);
                        }}
                        className={`${classes.navButton} ${isActive ? classes.active : ""}`}
                      >
                        <div className={classes.iconContainer}>
                          {isActive ? (
                            <div className={classes.statusDotActive}></div>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.icon}>
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </div>
                        <span className={classes.truncate}>{item.title}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className={classes.emptyMessage}>History is clear</p>
                )}
              </div>
            </div>

            <div className={classes.section}>
              <p className={classes.sectionTitle}>Help & Tools</p>
              <div className={classes.group}>
                <button className={classes.navButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.icon}>
                    <path d="M7 10v12M15 5.88l-1.4 4.12H20a2 2 0 012 2.56l-2.33 8A2 2 0 0117.5 22H4a2 2 0 01-2-2v-8a2 2 0 012-2h2.76a2 2 0 001.79-1.11L12 2a3.13 3.13 0 013 3.88Z"/>
                  </svg>
                  <span>Feedback</span>
                </button>
                <button className={classes.navButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={classes.icon}>
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12M3.95 6.06L8.54 14M10.88 21.94L15.46 14"/>
                  </svg>
                  <span>Chrome Extension</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={classes.userFooter} ref={menuRef}>
          {isMenuOpen && (
            <div className={classes.userMenu}>
              <button
                className={classes.menuItem}
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Settings
              </button>
              <button className={classes.menuItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Dark Mode
              </button>
              <div className={classes.divider}></div>
              <button className={`${classes.menuItem} ${classes.logout}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </div>
          )}

          <div className={classes.planBadge}>
            <p className={classes.planText}>
              <span className={classes.planType}>free</span> Plan
            </p>
          </div>

          <button
            className={`${classes.userButton} ${isMenuOpen ? classes.activeButton : ""}`}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={classes.userInfo}>
              <span className={classes.avatar}>
                <img draggable="false" src="https://lh3.googleusercontent.com/a/ACg8ocKMeWGFRPZyCAByPwWqRT1jL9b0ftQZ4LFguAxumFsbpYSrxAsm=s96-c" alt="Avatar" />
              </span>
              <div className={classes.nameWrapper}>
                <p className={classes.userName}>{userName}</p>
              </div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`${classes.chevronIcon} ${isMenuOpen ? classes.rotate : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <UserSetModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isAddModalOpen && (
        <AddContentModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddContent}
        />
      )}
    </>
  );
}