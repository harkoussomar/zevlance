// store/auth-store.ts
import { Role } from '@/types'
import { create } from 'zustand'

interface AuthState {
  userId: string | null
  email: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (data: { email: string; role: Role; userId: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  userId: null,
  email: null,
  role: null,
  isAuthenticated: false,
  login: (data) => set({ ...data, isAuthenticated: true }),
  logout: () => set({ userId: null, email: null, role: null, isAuthenticated: false }),
}))