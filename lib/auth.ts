import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type Role = 'user' | 'professional' | 'admin'

// Step 1: find out who is logged in and what their role is
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email,
    name: profile.name as string | null,
    role: profile.role as Role,
  }
}

// Step 2: check login + role in one call
export async function authorize(allowedRoles: Role[]) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { user, error: null }
}