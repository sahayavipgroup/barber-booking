'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service } from '@/lib/types'

type Props = {
  services: Pick<Service, 'id' | 'title' | 'price'>[]
  defaultServiceId?: string
}

export default function BookingForm({ services, defaultServiceId }: Props) {
  const router = useRouter()
  const [serviceId, setServiceId] = useState(defaultServiceId ?? '')
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        date: new Date(date).toISOString(),
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
    } else {
      setSuccess(true)
      setDate('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900">Book a service</h2>

      <select
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
      >
        <option value="">Choose a service...</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} (${Number(s.price).toFixed(2)})
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Booking created!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Booking...' : 'Book now'}
      </button>
    </form>
  )
}