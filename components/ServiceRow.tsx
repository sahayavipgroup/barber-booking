'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ServiceForm from './ServiceForm'
import type { Service } from '@/lib/types'

export default function ServiceRow({
  service,
  ownerName,
}: {
  service: Service
  ownerName?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(method: 'PATCH' | 'DELETE') {
    setBusy(true)
    setError(null)

    const res = await fetch(`/api/services/${service.id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PATCH' ? JSON.stringify({ active: !service.active }) : undefined,
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
    if (confirm('Delete this service? Its bookings will be deleted too.')) send('DELETE')
  }

  if (editing) {
    return <ServiceForm service={service} onDone={() => setEditing(false)} />
  }

  return (
    <div className={`rounded-xl bg-white p-4 shadow ${service.active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">
            {service.title}{' '}
            {!service.active && (
              <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                Hidden
              </span>
            )}
          </p>
          <p className="text-sm text-gray-600">{service.description ?? 'No description'}</p>
          {ownerName && (
  <p className="text-xs font-medium text-red-600">Barber: {ownerName}</p>
)}
          <p className="mt-1 font-bold text-gray-900">${Number(service.price).toFixed(2)}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => send('PATCH')}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {service.active ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}