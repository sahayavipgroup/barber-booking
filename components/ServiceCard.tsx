import Link from 'next/link'

type Props = {
  id: string
  title: string
  description: string | null
  price: number
  showBook: boolean
  bookHref: string
}

export default function ServiceCard({ title, description, price, showBook, bookHref }: Props) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-white p-5 shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description ?? 'No description'}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">${Number(price).toFixed(2)}</span>
        {showBook && (
          <Link
            href={bookHref}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Book now
          </Link>
        )}
      </div>
    </div>
  )
}