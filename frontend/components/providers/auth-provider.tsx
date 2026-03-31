// providers/auth-provider.tsx
'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import api from '@/lib/axios'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => login(res.data))
      .catch(() => logout())
  }, [])

  return <>{children}</>
}
