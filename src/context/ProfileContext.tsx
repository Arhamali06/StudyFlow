import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'

export interface Profile {
  id: string
  full_name: string
  created_at: string
}

interface ProfileContextValue {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  updateFullName: (fullName: string) => Promise<{ ok: true; profile: Profile } | { ok: false; error: string }>
}

// oxlint-disable-next-line react/only-export-components
export const ProfileContext = createContext<ProfileContextValue | null>(null)

function profileFromRow(row: { id: string; full_name: string; created_at: string }): Profile {
  return { id: row.id, full_name: row.full_name, created_at: row.created_at }
}

export function ProfileProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setProfile(null)
    // oxlint-disable-next-line react/set-state-in-effect
    setError(null)
    // oxlint-disable-next-line react/set-state-in-effect
    setIsLoading(Boolean(user))
    if (!user) return () => { active = false }

    void (async () => {
      const { data, error: requestError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .eq('id', user.id)
        .maybeSingle()
      if (!active) return
      if (requestError) {
        setError('Unable to load your profile.')
        setIsLoading(false)
        return
      }

      if (data) {
        setProfile(profileFromRow(data))
        setIsLoading(false)
        return
      }

      const fullName = typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName }, { onConflict: 'id' })
        .select('id, full_name, created_at')
        .single()
      if (!active) return
      if (createError) setError('Unable to create your profile.')
      else if (created) setProfile(profileFromRow(created))
      setIsLoading(false)
    })()

    return () => { active = false }
  }, [user])

  const updateFullName = useCallback(async (fullName: string) => {
    if (!user) return { ok: false as const, error: 'You must be signed in to update your profile.' }
    const { data, error: requestError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)
      .select('id, full_name, created_at')
      .single()
    if (requestError || !data) return { ok: false as const, error: 'Unable to save your display name. Please try again.' }
    const nextProfile = profileFromRow(data)
    setProfile(nextProfile)
    return { ok: true as const, profile: nextProfile }
  }, [user])

  const value = useMemo(() => ({ profile, isLoading, error, updateFullName }), [profile, isLoading, error, updateFullName])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

