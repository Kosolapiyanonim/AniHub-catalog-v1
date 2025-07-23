import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Server-side Supabase client.
 *
 * IMPORTANT:
 *  • Must be called **inside** a Server Component / Route Handler.
 *  • Uses the pattern required by Supabase Auth SSR helpers:
 *    https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth
 */
export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      // Always use getAll / setAll ─ never get / set / remove
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // If called in a server action, cookies.set may throw ― ignore silently
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          /* no-op */
        }
      },
    },
  })
}

// Optional default export so you can `import createClient from '...'`
export default createClient
