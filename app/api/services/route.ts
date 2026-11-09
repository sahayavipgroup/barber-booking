import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// GET /api/services → list services
export async function GET() {
  const { error } = await authorize(['user', 'professional', 'admin'])
  if (error) return error

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('services')
    .select('*')
    .order('title')

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/services → create a service
export async function POST(request: Request) {
  const { user, error } = await authorize(['professional', 'admin'])
  if (error) return error

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, description, price } = body

  if (typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'Price must be a number >= 0' }, { status: 400 })
  }

  // professionals create for themselves, admins choose the owner
  const professionalId = user.role === 'admin' ? body.professional_id : user.id
  if (!professionalId) {
    return NextResponse.json({ error: 'professional_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('services')
    .insert({
      title: title.trim(),
      description: description ?? null,
      price,
      professional_id: professionalId,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}