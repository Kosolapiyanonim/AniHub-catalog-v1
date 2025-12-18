/**
 * Role-based access control utilities
 * 
 * Roles:
 * - admin: Full access, can delete any comments, manage users
 * - manager: Moderate access, can manage content
 * - viewer: Default role, basic user permissions
 */

export type UserRole = 'admin' | 'manager' | 'viewer'

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  role: UserRole
}

/**
 * Get user role from Supabase client
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns User role or null if not found
 */
export async function getUserRole(
  supabase: any,
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as UserRole
}

/**
 * Get full user profile including role
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(
  supabase: any,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    username: data.username,
    avatar_url: data.avatar_url,
    role: data.role as UserRole
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'admin'
}

/**
 * Check if user has manager role or higher
 */
export function isManagerOrHigher(role: UserRole | null): boolean {
  return role === 'admin' || role === 'manager'
}

/**
 * Check if user can delete any comment (admin only)
 */
export function canDeleteAnyComment(role: UserRole | null): boolean {
  return role === 'admin'
}

/**
 * Check if user can delete their own comment
 */
export function canDeleteOwnComment(role: UserRole | null): boolean {
  return role !== null // All authenticated users can delete their own comments
}

