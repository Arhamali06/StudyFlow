import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type EmailUpdateStatus = 'updated' | 'pending'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  updateEmail: (email: string) => Promise<{ error: string | null; status?: EmailUpdateStatus }>
  reauthenticate: (password: string) => Promise<{ error: string | null }>
  signOutEverywhere: () => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.')
  return context
}
