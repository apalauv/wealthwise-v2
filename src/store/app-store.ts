import { create } from 'zustand'

export type PageType = 
  | 'landing' 
  | 'dashboard' 
  | 'evolucion' 
  | 'caja-fuerte' 
  | 'criptomonedas' 
  | 'defi' 
  | 'etfs-fondos' 
  | 'venture-capital' 
  | 'inmuebles' 
  | 'efemerides' 
  | 'tareas' 
  | 'goals' 
  | 'whales' 
  | 'market-analysis' 
  | 'insights' 
  | 'import'

interface AppState {
  currentPage: PageType
  sidebarOpen: boolean
  setCurrentPage: (page: PageType) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'landing',
  sidebarOpen: true,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
