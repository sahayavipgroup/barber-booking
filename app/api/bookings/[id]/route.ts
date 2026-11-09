import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ id: string }> }

const STATUSES = ['pending', 'confirmed', 'cancelled']

// PATCH /api/bookings/:id → change status
export async function PATCH(request: Request, { params }: Context) {
  const { user, error } = await authorize(['user', 'professional', 'admin'])
  if (error) return error

  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // a normal user may only cancel, never confirm
  if (user.role === 'user' && body.status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Users can only cancel bookings' },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('bookings')
    .update({ status: body.status })
    .eq('id', id)
    .select()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json(data[0])
}

// DELETE /api/bookings/:id → delete a booking
export async function DELETE(_request: Request, { params }: Context) {
  const { error } = await authorize(['user', 'admin'])
  if (error) return error

  const { id } = await params

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)
    .select()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}