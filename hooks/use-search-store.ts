import { create } from 'zustand'

interface SearchStore {
  isOpen: boolean
  toggle: () => void
  onOpen: () => void
  onClose: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
