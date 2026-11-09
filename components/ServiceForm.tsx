'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service } from '@/lib/types'

type Props = {
  service?: Service
  onDone?: () => void
}

export default function ServiceForm({ service, onDone }: Props) {
  const router = useRouter()
  const isEdit = !!service

  const [title, setTitle] = useState(service?.title ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [price, setPrice] = useState(service ? String(service.price) : '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(isEdit ? `/api/services/${service.id}` : '/api/services', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price: Number(price) }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
    } else {
      if (!isEdit) {
        setTitle('')
        setDescription('')
        setPrice('')
      }
      router.refresh()
      onDone?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-5 shadow">
      <h3 className="font-semibold text-gray-900">
        {isEdit ? 'Edit service' : 'Add a service'}
      </h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (e.g. Haircut)"
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Add service'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}