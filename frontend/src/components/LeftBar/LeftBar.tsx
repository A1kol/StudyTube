"use client";
import classes from "./LeftBar.module.scss";
import { useState, useEffect, useRef } from "react";
import UserSetModal from "../userSettingModal/userSetModal";
import AddContentModal from "../addContentModal/AddContentModal";
import { getUserFromToken } from "@/utils/getUserFromToken";
import { useRouter } from "next/navigation";
import { addToHistory } from "@/utils/historyStorage";
import { getRecent } from "@/utils/historyStorage";
import HistoryModal from "../HistoryModal/HistoryModal";
import { HistoryItem } from "@/utils/historyStorage";
import { getYoutubeId } from "@/utils/getYoutubeId";

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
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  useEffect(() => {
    setUserName(getUserFromToken());
  }, []);

  useEffect(() => {
    setRecentItems(getRecent())

    const handleStorage = () => {
      setRecentItems(getRecent())
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    router.push("/login");
    router.refresh();
  };
  
  const handleAddContent = (videoData: any) => {

    const url =
      videoData.url ||
      (videoData.youtubeId
        ? `https://www.youtube.com/watch?v=${videoData.youtubeId}`
        : null)

    if (!url) return

    const newItem = {
      id: Date.now().toString(),
      title: videoData.title || "Untitled video",
      url
    }

    addToHistory(newItem)

    setRecentItems(getRecent())

    const youtubeId = getYoutubeId(url)

    onVideoSelect?.({
      title: newItem.title,
      youtubeId
    })

    setIsAddModalOpen(false)
  }

  
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

              <button
                className={classes.navItem}
                onClick={() => setIsHistoryOpen(true)}
              >
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
              </button>
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
                {recentItems.length > 0 ? (
                  recentItems.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveId(item.id)

                          const youtubeId = getYoutubeId(item.url)

                          onVideoSelect?.({
                            title: item.title,
                            youtubeId
                          })
                        }}
                        className={`${classes.navButton} ${isActive ? classes.active : ""}`}
                      >
                        <div className={classes.iconContainer}>
                          <div className={classes.iconContainer}>
                            {isActive ? (
                              <div className={classes.currentDot}></div>
                            ) : (
                              <div className={classes.playIcon}>▶</div>
                            )}
                          </div>
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
              <button
                className={`${classes.menuItem} ${classes.logout}`}
                onClick={handleLogout}
              >
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
                <img
                  draggable="false"
                  src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                  alt="Avatar"
                />
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

      {isHistoryOpen && (
        <HistoryModal
          onClose={()=>setIsHistoryOpen(false)}
          onSelect={(video: HistoryItem) => {

            const youtubeId = getYoutubeId(video.url)
            if (!youtubeId) return

            const newItem = {
              id: Date.now().toString(),
              title: video.title,
              url: video.url
            }

            addToHistory(newItem)

            setRecentItems(getRecent())

            setActiveId(newItem.id)

            onVideoSelect?.({
              title: video.title,
              youtubeId
            })

            setIsHistoryOpen(false)
          }}
        />
      )}
    </>
  );
}