"use client"

import * as React from "react"
import { Root as RadixVisuallyHidden } from "@radix-ui/react-visually-hidden"

/**
 * VisuallyHidden
 * -----------------------------------------------------------------------------
 * A11y helper that keeps content visible to screen-readers while visually
 * hiding it from sighted users.  We simply re-export Radix’s implementation
 * so the API stays consistent with the rest of shadcn/ui.
 *
 * Example:
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 */
export const VisuallyHidden = React.forwardRef<
  React.ElementRef<typeof RadixVisuallyHidden>,
  React.ComponentPropsWithoutRef<typeof RadixVisuallyHidden>
>((props, ref) => <RadixVisuallyHidden ref={ref} {...props} />)

VisuallyHidden.displayName = "VisuallyHidden"

export default VisuallyHidden
