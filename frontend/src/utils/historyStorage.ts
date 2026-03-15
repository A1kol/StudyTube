import { getUserFromToken } from "@/utils/getUserFromToken"

export type HistoryItem = {
  id: string
  title: string
  url: string
}

function getStorageKey() {
  const user = getUserFromToken()

  if (!user) return "studai_history_guest"

  return `studai_history_${user}`
}

export function getHistory(): HistoryItem[] {

  if (typeof window === "undefined") return []

  try {

    const key = getStorageKey()

    const data = localStorage.getItem(key)

    return data ? JSON.parse(data) : []

  } catch {

    return []

  }

}

export function addToHistory(item: HistoryItem) {

  if (typeof window === "undefined") return

  const key = getStorageKey()

  const history = getHistory()

  const filtered = history.filter(h => h.url !== item.url)

  const newHistory = [
    item,
    ...filtered
  ].slice(0, 20)

  localStorage.setItem(key, JSON.stringify(newHistory))

}

export function getRecent(): HistoryItem[] {

  return getHistory().slice(0, 3)

}