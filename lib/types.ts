export type Service = {
  id: string
  title: string
  description: string | null
  price: number
  professional_id: string
  active: boolean
}
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type Booking = {
  id: string
  service_id: string
  user_id: string
  date: string
  status: BookingStatus
  created_at: string
}

// a booking plus the service details we join in
export type BookingWithService = Booking & {
  services: { title: string; price: number } | null
  profiles?: { name: string | null } | null
}
import type { Role } from '@/lib/auth'

export type Profile = {
  id: string
  role: Role
  name: string | null
  created_at: string
}

export type ServiceWithOwner = Service & {
  profiles: { name: string | null } | null
}