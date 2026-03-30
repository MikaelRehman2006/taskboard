import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useGuestAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      setError(null)
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr) throw sessionErr
        if (cancelled) return

        if (sessionData.session?.user) {
          setUser(sessionData.session.user)
          setLoading(false)
          return
        }

        const { data, error: anonErr } = await supabase.auth.signInAnonymously()
        if (anonErr) throw anonErr
        if (cancelled) return
        setUser(data.user ?? null)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not start guest session')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
