"use client"

import { useMemo } from "react"
import { getProxiedImageUrl } from "@/lib/image-utils"

/**
 * Hook to get proxied image URL
 * @param originalUrl - Original image URL
 * @returns Proxied URL or original URL
 */
export function useImageProxy(originalUrl: string | null | undefined): string | null {
  return useMemo(() => {
    return getProxiedImageUrl(originalUrl)
  }, [originalUrl])
}





