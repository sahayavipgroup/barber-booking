'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from './StatusBadge'
import type { BookingWithService, BookingStatus } from '@/lib/types'
import type { Role } from '@/lib/auth'

type Props = { booking: BookingWithService; role: Role }

const accent = {
  user: 'border-blue-500',
  professional: 'border-emerald-500',
  admin: 'border-red-500',
}

export default function BookingRow({ booking, role }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(method: 'PATCH' | 'DELETE', status?: BookingStatus) {
    setBusy(true)
    setError(null)

    const res = await fetch(`/api/bookings/${booking.id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PATCH' ? JSON.stringify({ status }) : undefined,
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    } else {
      router.refresh()
    }
    setBusy(false)
  }

  function handleDelete() {
    if (confirm('Delete this booking?')) send('DELETE')
  }

  const canConfirm = role !== 'user' && booking.status === 'pending'
  const canCancel = booking.status !== 'cancelled'
  const canDelete = role !== 'professional'

  return (
    <div className={`rounded-xl border-l-4 bg-white p-4 shadow ${accent[role]}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">
            {booking.services?.title ?? 'Service unavailable'}
          </p>
          {role !== 'user' && (
            <p className="text-sm text-gray-600">
              Customer: {booking.profiles?.name ?? 'Unknown'}
            </p>
          )}
          <p className="text-sm text-gray-600" suppressHydrationWarning>
            {new Date(booking.date).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={booking.status} />
          {canConfirm && (
            <button
              onClick={() => send('PATCH', 'confirmed')}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Confirm
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => send('PATCH', 'cancelled')}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}