import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1) update the request, so the rest of this request sees the new login
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // 2) build a fresh response and put the new cookies on it for the browser
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This call checks the login and refreshes it if it has expired.
  // Don't put other code between creating the client and this line.
  await supabase.auth.getUser()

  return supabaseResponse
}