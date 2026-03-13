export type HistoryItem = {
  id: string
  title: string
  url: string
}

const STORAGE_KEY = "studai_history"

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addToHistory(item: HistoryItem) {
  if (typeof window === "undefined") return

  const history = getHistory()

  const filtered = history.filter(h => h.url !== item.url)

  const newHistory = [
    item,
    ...filtered
  ].slice(0, 20)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
}

export function getRecent(): HistoryItem[] {
  return getHistory().slice(0, 3)
}