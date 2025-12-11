import { create } from "zustand"

interface SearchStore {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
  onOpen: () => void
  onClose: () => void
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  // Aliases for backward compatibility
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
