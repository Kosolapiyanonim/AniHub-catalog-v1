import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can throw an error when called from a Server Component
            // that uses the `cookies()` function. This is because the `cookies()` function
            // makes the Server Component dynamic, and it cannot be cached.
            //
            // If you are using a Server Component, you can only read cookies.
            // To set cookies, you must use a Client Component or a Server Action.
            console.warn('Could not set cookie from Server Component:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.warn('Could not remove cookie from Server Component:', error);
          }
        },
      },
    }
  )
}
