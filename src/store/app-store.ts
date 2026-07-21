import { create } from 'zustand'

export type AppView =
  | 'landing'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'profile'
  | 'wizard'
  | 'editor'

interface AppState {
  currentView: AppView
  selectedBookId: string | null
  user: {
    id: string
    email: string
    fullName: string | null
  } | null
  setView: (view: AppView) => void
  setSelectedBookId: (id: string | null) => void
  setUser: (user: AppState['user']) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'landing',
  selectedBookId: null,
  user: null,
  setView: (view) => set({ currentView: view }),
  setSelectedBookId: (id) => set({ selectedBookId: id }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, currentView: 'landing' }),
}))