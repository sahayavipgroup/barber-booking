import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import ServiceCard from '@/components/ServiceCard'
import type { Service } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('title')

  const services = (data ?? []) as Service[]
  const canBook = !user || user.role === 'user'

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">Our services</h1>
      <p className="mt-1 text-gray-600">Pick a service and book your appointment.</p>

      {services.length === 0 ? (
        <p className="mt-8 text-gray-500">No services available yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              showBook={canBook}
              bookHref={user ? `/bookings?service=${service.id}` : '/login'}
            />
          ))}
        </div>
      )}
    </main>
  )
}