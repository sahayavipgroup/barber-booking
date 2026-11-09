'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/auth'

type Props = { userId: string; currentRole: Role; disabled?: boolean }

export default function RoleSelect({ userId, currentRole, disabled }: Props) {
  const router = useRouter()
  const [role, setRole] = useState<Role>(currentRole)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role
    setBusy(true)
    setError(null)

    const res = await fetch(`/api/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    } else {
      setRole(newRole)
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <div>
      <select
        value={role}
        onChange={handleChange}
        disabled={disabled || busy}
        className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-900 disabled:bg-gray-100"
      >
        <option value="user">Customer</option>
        <option value="professional">Barber</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}