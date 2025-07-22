"use client"

import type * as React from "react"
import { Toaster as SonnerToaster } from "sonner"

/**
 * Re-export of the `sonner` toaster so pages can simply
 * import it from "@/components/ui/sonner".
 */
export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return <SonnerToaster {...props} />
}

export default Toaster
