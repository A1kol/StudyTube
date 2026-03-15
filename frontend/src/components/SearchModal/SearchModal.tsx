"use client"

import { useState, useEffect } from "react"
import classes from "./SearchModal.module.scss"
import { getHistory, HistoryItem } from "@/utils/historyStorage"
import { getYoutubeId } from "@/utils/getYoutubeId"

interface SearchModalProps {
  onClose: () => void
  onSelect: (video: HistoryItem) => void
}

export default function SearchModal({ onClose, onSelect }: SearchModalProps) {

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const filtered = history.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className={classes.overlay}>

      <div className={classes.modal}>

        <div className={classes.header}>
          <input
            placeholder="Search videos..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            className={classes.searchInput}
          />

          <button onClick={onClose} className={classes.closeBtn}>
            ✕
          </button>
        </div>

        <div className={classes.results}>

          {filtered.length > 0 ? (
            filtered.map(item => (
              <button
                key={item.id}
                className={classes.resultItem}
                onClick={()=>onSelect(item)}
              >
                ▶ {item.title}
              </button>
            ))
          ) : (
            <p className={classes.empty}>Nothing found</p>
          )}

        </div>

      </div>

    </div>
  )
}