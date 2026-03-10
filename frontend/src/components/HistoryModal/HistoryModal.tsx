"use client"

import { HistoryItem, getHistory } from "@/utils/historyStorage"
import { useEffect, useState } from "react"
import classes from "./HistoryModal.module.scss"

interface HistoryModalProps {
  onClose: () => void
  onSelect: (item: HistoryItem) => void
}

export default function HistoryModal({ onClose, onSelect }: HistoryModalProps) {

  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    setItems(getHistory())
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)

    return () => window.removeEventListener("keydown", handleEsc)
    }, [])

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.modal} onClick={(e)=>e.stopPropagation()}>

        <h2 className={classes.title}>History</h2>

        <div className={classes.list}>
          {items.length === 0 && <p className={classes.empty}>History is empty</p>}

          {items.map((item)=>(
            <button
              key={item.id}
              className={classes.item}
              onClick={()=>{
                onSelect(item)
                onClose()
              }}
            >
              {item.title}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}