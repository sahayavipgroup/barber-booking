import { NextResponse } from 'next/server'
import { authorize } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

type Context = { params: Promise<{ id: string }> }

// PATCH /api/services/:id → edit a service
export async function PATCH(request: Request, { params }: Context) {
  const { error } = await authorize(['professional', 'admin'])
  if (error) return error

  const { id } = await params

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // only copy the fields we allow to change
  const updates: Record<string, unknown> = {}

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }
    updates.title = body.title.trim()
  }
  if (body.description !== undefined) {
    updates.description = body.description
  }
  if (body.price !== undefined) {
    if (typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }
    updates.price = body.price
  }
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active value' }, { status: 400 })
    }
    updates.active = body.active
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  return NextResponse.json(data[0])
}

// DELETE /api/services/:id → delete a service
export async function DELETE(_request: Request, { params }: Context) {
  const { error } = await authorize(['professional', 'admin'])
  if (error) return error

  const { id } = await params

  const supabase = await createClient()
  const { data, error: dbError } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .select()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}