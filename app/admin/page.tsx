import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import RoleSelect from '@/components/RoleSelect'
import ServiceRow from '@/components/ServiceRow'
import BookingRow from '@/components/BookingRow'
import type { Profile, ServiceWithOwner, BookingWithService } from '@/lib/types'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role === 'user') redirect('/bookings')
  if (user.role === 'professional') redirect('/dashboard')

  const supabase = await createClient()

  const { data: usersData } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: servicesData } = await supabase
    .from('services')
    .select('*, profiles(name)')
    .order('title')

  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('*, services(title, price), profiles(name)')
    .order('date', { ascending: true })

  const users = (usersData ?? []) as Profile[]
  const services = (servicesData ?? []) as unknown as ServiceWithOwner[]
  const bookings = (bookingsData ?? []) as unknown as BookingWithService[]

  const stats = [
    { label: 'Customers', value: users.filter((u) => u.role === 'user').length },
    { label: 'Barbers', value: users.filter((u) => u.role === 'professional').length },
    { label: 'Services', value: services.length },
    { label: 'Bookings', value: bookings.length },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length },
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin panel</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow">
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-900">
                    {u.name ?? 'No name'}
                    {u.id === user.id && <span className="ml-2 text-xs text-gray-500">(you)</span>}
                  </td>
                  <td className="px-4 py-2">
                    <RoleSelect userId={u.id} currentRole={u.role} disabled={u.id === user.id} />
                  </td>
                  <td className="px-4 py-2 text-gray-600" suppressHydrationWarning>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">All services</h2>
          {services.length === 0 ? (
            <p className="text-gray-500">No services yet.</p>
          ) : (
            services.map((s) => (
              <ServiceRow key={s.id} service={s} ownerName={s.profiles?.name ?? 'Unknown'} />
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">All bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            bookings.map((b) => <BookingRow key={b.id} booking={b} role={user.role} />)
          )}
        </section>
      </div>
    </main>
  )
}