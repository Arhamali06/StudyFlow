import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import { AuthContext, type AuthContextValue } from './authContext'
import { getFriendlyAuthError } from '../utils/authErrors'

function getErrorMessage(error: { message: string } | null): string | null {
  return error ? getFriendlyAuthError(error.message) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.error('Unable to restore the Supabase session.', error)
      }
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: getErrorMessage(error) }
    },
    async signUp(name, email, password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      })
      return { error: getErrorMessage(error) }
    },
    async requestPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error: getErrorMessage(error) }
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password })
      return { error: getErrorMessage(error) }
    },
    async updateEmail(email) {
      const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: window.location.origin })
      return { error: getErrorMessage(error) }
    },
    async reauthenticate(password) {
      if (!session?.user.email) return { error: 'Your account does not have an email identity.' }
      const { error } = await supabase.auth.signInWithPassword({ email: session.user.email, password })
      return { error: getErrorMessage(error) }
    },
    async signOutEverywhere() {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      return { error: getErrorMessage(error) }
    },
    async signOut() {
      const { error } = await supabase.auth.signOut()
      return { error: getErrorMessage(error) }
    },
  }), [loading, session])

  if (loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
