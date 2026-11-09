import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import ServiceForm from '@/components/ServiceForm'
import ServiceRow from '@/components/ServiceRow'
import BookingRow from '@/components/BookingRow'
import type { Service, BookingWithService } from '@/lib/types'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role === 'user') redirect('/bookings')
  if (user.role === 'admin') redirect('/admin')

  const supabase = await createClient()

  const { data: servicesData } = await supabase
    .from('services')
    .select('*')
    .eq('professional_id', user.id)
    .order('title')

  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('*, services(title, price), profiles(name)')
    .order('date', { ascending: true })

  const services = (servicesData ?? []) as Service[]
  const bookings = (bookingsData ?? []) as unknown as BookingWithService[]
  const pending = bookings.filter((b) => b.status === 'pending').length

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800">Professional dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">My services</p>
          <p className="text-2xl font-bold text-emerald-900">{services.length}</p>
        </div>
        <div className="rounded-xl bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">Pending bookings</p>
          <p className="text-2xl font-bold text-yellow-900">{pending}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">My services</h2>
          <ServiceForm />
          {services.map((s) => (
            <ServiceRow key={s.id} service={s} />
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Bookings for my services</h2>
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