"use client"

import { useEffect, useState } from "react"

/**
 * useDebounce
 * -----------
 * Keeps the given `value` unchanged until the user stops
 * changing it for `delay` ms.  Handy for search boxes, etc.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

export default useDebounce
