import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// GET /api/bookings → list bookings (RLS filters by role)
export async function GET() {
  const { error } = await authorize(['user', 'professional', 'admin'])
  if (error) return error

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('bookings')
    .select('*, services(title, price, professional_id)')
    .order('date', { ascending: true })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/bookings → create a booking
export async function POST(request: Request) {
  const { user, error } = await authorize(['user', 'admin'])
  if (error) return error

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { service_id, date } = body

  if (typeof service_id !== 'string' || service_id === '') {
    return NextResponse.json({ error: 'service_id is required' }, { status: 400 })
  }

  const parsedDate = typeof date === 'string' ? new Date(date) : null
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }
  if (parsedDate <= new Date()) {
    return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 })
  }

  // users book for themselves, admins choose the user
  const userId = user.role === 'admin' ? body.user_id : user.id
  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('bookings')
    .insert({
      service_id,
      user_id: userId,
      date: parsedDate.toISOString(),
      // status is NOT taken from the body: it always starts as 'pending'
    })
    .select()
    .single()

  if (dbError) {
    // 42501 = blocked by RLS (inactive service), 23503 = service doesn't exist
    if (dbError.code === '42501' || dbError.code === '23503') {
      return NextResponse.json(
        { error: 'Service not found or not available' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}