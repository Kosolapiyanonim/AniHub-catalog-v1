/**
 * Utility functions for authentication redirects
 */

/**
 * Get login URL with redirect parameter
 * @param currentPath - Current page path (e.g., "/anime/123" or "/catalog?page=2")
 * @returns Login URL with redirect query parameter
 */
export function getLoginUrl(currentPath?: string): string {
  if (!currentPath || currentPath === "/login" || currentPath === "/register") {
    return "/login"
  }
  // Security: Ensure path is relative
  const safePath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`
  return `/login?redirect=${encodeURIComponent(safePath)}`
}

/**
 * Get register URL with redirect parameter
 * @param currentPath - Current page path (e.g., "/anime/123" or "/catalog?page=2")
 * @returns Register URL with redirect query parameter
 */
export function getRegisterUrl(currentPath?: string): string {
  if (!currentPath || currentPath === "/login" || currentPath === "/register") {
    return "/register"
  }
  // Security: Ensure path is relative
  const safePath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`
  return `/register?redirect=${encodeURIComponent(safePath)}`
}

/**
 * Get current path from window.location (client-side only)
 * Includes pathname and search params
 */
export function getCurrentPath(): string {
  if (typeof window === "undefined") return "/"
  return window.location.pathname + window.location.search
}
