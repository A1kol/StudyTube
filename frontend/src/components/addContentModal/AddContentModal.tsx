"use client";
import { useState } from "react";
import classes from "./AddContentModal.module.scss";

interface AddContentModalProps {
  onClose: () => void;
  onSubmit: (videoData: any) => void;
}

export default function AddContentModal({ onClose, onSubmit }: AddContentModalProps) {
  const [category, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      params.append("url", url.trim());
      if (category.trim()) {
        params.append("category", category.trim());
      }
      const response = await fetch(`/api/videos/add?${params.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
      });

      if (response.ok) {
        const userVideoData = await response.json();
        onSubmit(userVideoData.video);

        onClose();
      } else {
        const errorData = await response.text();
        console.error("Server error:", errorData);
        alert("Ошибка при сохранении видео");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Ошибка сети. Проверьте соединение с сервером.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.modalOverlay} onClick={onClose}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <h2>Add New Content</h2>
          <button className={classes.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <label>Category</label>
            <input
              type="text"
              placeholder="e.g. Programming"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={classes.inputGroup}>
            <label>YouTube URL</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className={classes.actions}>
            <button type="button" className={classes.cancelBtn} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={classes.submitBtn} disabled={isLoading}>
              {isLoading ? "Saving..." : "Add to Space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}