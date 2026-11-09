import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import LogoutButton from './LogoutButton'

const styles = {
  guest: {
    bar: 'bg-white border-b border-gray-200 text-gray-800',
    link: 'hover:text-blue-600',
    badge: '',
  },
  user: {
    bar: 'bg-white border-b-4 border-blue-500 text-gray-800',
    link: 'hover:text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  professional: {
    bar: 'bg-emerald-700 text-white',
    link: 'hover:text-emerald-200',
    badge: 'bg-emerald-100 text-emerald-900',
  },
  admin: {
    bar: 'bg-gray-900 text-white',
    link: 'hover:text-red-300',
    badge: 'bg-red-500 text-white',
  },
}

const roleLabels = {
  user: 'Customer',
  professional: 'Barber',
  admin: 'Admin',
}

export default async function Navbar() {
  const user = await getCurrentUser()
  const s = styles[user?.role ?? 'guest']

  const links = [{ href: '/', label: 'Services' }]
  if (user?.role === 'user') links.push({ href: '/bookings', label: 'My bookings' })
  if (user?.role === 'professional') links.push({ href: '/dashboard', label: 'Dashboard' })
  if (user?.role === 'admin') links.push({ href: '/admin', label: 'Admin panel' })

  return (
    <nav className={`${s.bar}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Barber Booking
          </Link>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-medium ${s.link}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
                {roleLabels[user.role]}
              </span>
              <span>{user.name ?? user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={s.link}>Log in</Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}