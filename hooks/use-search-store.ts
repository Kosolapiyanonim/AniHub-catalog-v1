// hooks/use-search-store.ts

import { create } from 'zustand'

interface SearchStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
