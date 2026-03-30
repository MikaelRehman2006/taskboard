import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Task } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anon)
}

/** Null when env is missing — avoids createClient('') which throws and blanks the app. */
export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null

export type TaskRow = Task
