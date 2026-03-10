export type HistoryItem = {
  id: string
  title: string
  url: string
}

const STORAGE_KEY = "studai_history"

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
}

export function addToHistory(item: HistoryItem) {
  const history = getHistory()

  // удаляем дубликаты
  const filtered = history.filter(h => h.url !== item.url)

  const newHistory = [item, ...filtered]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))

  console.log("History saved to:", STORAGE_KEY, "New history:", newHistory);
}

export function getRecent(): HistoryItem[] {
  return getHistory().slice(0, 3)
}