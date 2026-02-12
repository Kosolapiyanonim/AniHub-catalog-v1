/**
 * Admin authentication and authorization utilities
 * 
 * Provides utilities for checking admin/manager access
 */

import { createClient } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher, UserRole } from "@/lib/role-utils"
import type { User } from "@supabase/supabase-js"

/**
 * Check if user has admin or manager role
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns true if user is admin or manager, false otherwise
 */
export async function hasAdminAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, userId)
  return isManagerOrHigher(role)
}

/**
 * Get user role for admin access check
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns User role or null
 */
export async function getAdminUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<UserRole | null> {
  return await getUserRole(supabase, userId)
}

/**
 * Check if user can access admin panel
 * @param user - User object from Supabase Auth
 * @returns true if user can access admin panel
 */
export async function canAccessAdminPanel(user: User | null): Promise<boolean> {
  if (!user) {
    return false
  }

  const supabase = await createClient()
  const role = await getUserRole(supabase, user.id)
  return isManagerOrHigher(role)
}





