import { create } from "zustand"

export type Filter = "all" | "active" | "completed"
export type QuickFilter = "today" | "important" | "due-soon" | null

type UiState = {
  filter: Filter
  quickFilter: QuickFilter
  searchQuery: string
  setFilter: (filter: Filter) => void
  setQuickFilter: (q: QuickFilter) => void
  setSearchQuery: (q: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  filter: "all",
  quickFilter: null,
  searchQuery: "",
  setFilter: (filter) => set({ filter }),
  setQuickFilter: (quickFilter) => set({ quickFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))


