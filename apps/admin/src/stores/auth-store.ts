import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Permission, SessionUser } from '@/services'

interface AuthState {
  token: string | null
  user: SessionUser | null
  setSession: (token: string, user: SessionUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'qeetmart-admin-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export function hasPermission(user: SessionUser | null, permission: Permission) {
  return Boolean(user?.permissions.includes(permission))
}
