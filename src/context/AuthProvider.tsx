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
    let authEventVersion = 0

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return
      const sessionVersion = authEventVersion
      if (error) {
        console.error('Unable to restore the Supabase session.', error)
      }
      let nextSession = data.session
      if (nextSession) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (!active) return
        if (userError) {
          console.error('Unable to refresh the authenticated user.', userError)
        } else if (userData.user) {
          nextSession = { ...nextSession, user: userData.user }
        }
      }
      if (!active || authEventVersion !== sessionVersion) return
      setSession(nextSession)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventVersion += 1
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
      const { data, error } = await supabase.auth.updateUser({ email })
      if (error) {
        console.error('Supabase email update failed.', {
          message: error.message,
          name: error.name,
          status: error.status,
          code: error.code,
        })
        return { error: getErrorMessage(error) }
      }

      const requestedEmail = email.trim().toLowerCase()
      const returnedEmail = data.user?.email?.trim().toLowerCase()
      const pendingEmail = data.user?.new_email?.trim().toLowerCase()

      if (returnedEmail === requestedEmail) {
        if (data.user) setSession((current) => current ? { ...current, user: data.user } : current)
        return { error: null, status: 'updated' }
      }

      if (pendingEmail === requestedEmail) {
        if (data.user) setSession((current) => current ? { ...current, user: data.user } : current)
        return { error: null, status: 'pending' }
      }

      console.error('Supabase email update returned an unexpected user.', {
        requestedEmail: email,
        returnedEmail: data.user?.email,
        pendingEmail: data.user?.new_email,
        emailConfirmedAt: data.user?.email_confirmed_at,
      })
      return { error: 'Supabase did not apply the requested email change. Please try again.' }
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
