import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import BookingForm from '@/components/BookingForm'
import BookingRow from '@/components/BookingRow'
import type { BookingWithService } from '@/lib/types'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  // role guard: only customers belong here
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role === 'professional') redirect('/dashboard')
  if (user.role === 'admin') redirect('/admin')

  const { service } = await searchParams
  const supabase = await createClient()

  const { data: servicesData } = await supabase
    .from('services')
    .select('id, title, price')
    .eq('active', true)
    .order('title')

  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('*, services(title, price)')
    .order('date', { ascending: true })

  const services = servicesData ?? []
  const bookings = (bookingsData ?? []) as unknown as BookingWithService[]

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">My bookings</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <BookingForm services={services} defaultServiceId={service} />
        </div>

        <div className="space-y-3 md:col-span-2">
          {bookings.length === 0 ? (
            <p className="text-gray-500">You have no bookings yet.</p>
          ) : (
            bookings.map((b) => <BookingRow key={b.id} booking={b} role={user.role} />)
          )}
        </div>
      </div>
    </main>
  )
}