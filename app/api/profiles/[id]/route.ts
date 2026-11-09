import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ id: string }> }

const ROLES = ['user', 'professional', 'admin']

// PATCH /api/profiles/:id → change a user's role (admin only)
export async function PATCH(request: Request, { params }: Context) {
  const { user, error } = await authorize(['admin'])
  if (error) return error

  const { id } = await params

  // stops an admin from locking themselves out
  if (id === user.id) {
    return NextResponse.json(
      { error: 'You cannot change your own role' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || !ROLES.includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('profiles')
    .update({ role: body.role })
    .eq('id', id)
    .select()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(data[0])
}