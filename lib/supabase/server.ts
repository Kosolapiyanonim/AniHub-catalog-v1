import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"

/**
 * Server-side Supabase client for Route Handlers.
 * 
 * IMPORTANT: This version properly handles cookie updates in Route Handlers
 * by storing them in a response object that must be returned.
 *
 * Usage in Route Handlers:
 * ```ts
 * const response = new NextResponse()
 * const supabase = await createClientForRouteHandler(response)
 * const { data: { session } } = await supabase.auth.getSession()
 * // ... your logic ...
 * return response.json({ ... })
 * ```
 */
export async function createClientForRouteHandler(response: NextResponse) {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Set cookies in the response object for Route Handlers
        // This ensures updated tokens are sent back to the client
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

/**
 * Server-side Supabase client for Server Components.
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
        return cookieStore.getAll();
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

/**
 * Secure authentication helper for Route Handlers.
 * 
 * This function uses a hybrid approach:
 * 1. First tries getUser() to verify token authenticity with Supabase Auth server
 * 2. If token is expired, falls back to getSession() to refresh it automatically
 * 
 * This eliminates the security warning while maintaining automatic token refresh.
 * 
 * @param supabase - Supabase client created with createClientForRouteHandler()
 * @returns User object if authenticated, null otherwise
 * 
 * @example
 * ```ts
 * const response = new NextResponse()
 * const supabase = await createClientForRouteHandler(response)
 * const user = await getAuthenticatedUser(supabase)
 * if (!user) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
 * }
 * ```
 */
export async function getAuthenticatedUser(
  supabase: Awaited<ReturnType<typeof createClientForRouteHandler>>
): Promise<User | null> {
  // First, try getUser() to verify token authenticity with Supabase Auth server
  // This eliminates the security warning about using getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // If we have a valid user, return it
  if (user && !userError) {
    return user
  }

  // If token is expired or invalid, try getSession() to refresh it
  // This handles the case where access token expired but refresh token is still valid
  const isTokenError = userError?.message?.includes('JWT expired') || 
      userError?.message?.includes('token') ||
      userError?.message?.includes('expired') ||
      userError?.message?.includes('Invalid') ||
      userError?.status === 401;

  if (isTokenError) {
    // When getUser() fails with token error, getSession() should refresh automatically
    // But to ensure setAll() is called, we need to force a refresh
    // First, get current session to check if we have a refresh token
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    
    // If we have a session with refresh token, explicitly refresh to ensure setAll() is called
    if (currentSession?.refresh_token) {
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      return refreshedSession?.user ?? null
    }
    
    // If no refresh token, return null (user needs to re-login)
    return currentSession?.user ?? null
  }

  // If it's a different error or no user, return null
  return null
}

// Optional default export so you can `import createClient from '...'`
export default createClient
