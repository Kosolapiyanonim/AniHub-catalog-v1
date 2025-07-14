"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AnimeListPopover } from "./AnimeListPopover"

export interface AddToListButtonProps {
  /* Full anime object as expected by AnimeListPopover */
  anime: Parameters<typeof AnimeListPopover>[0]["anime"]
  /**
   * Optional Tailwind / className if you need custom sizing
   * (e.g. h-8 w-8 on cards, or normal button on detail page)
   */
  className?: string
}

/**
 * Renders a "+" icon.
 * On click it opens AnimeListPopover, letting the user pick a status.
 */
export function AddToListButton({ anime, className }: AddToListButtonProps) {
  return (
    <AnimeListPopover anime={anime}>
      <Button
        variant="secondary"
        size="icon"
        className={className ?? "h-8 w-8"}
        // stop card-navigation clicks if used inside links
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </AnimeListPopover>
  )
}

/* default export for convenience */
export default AddToListButton
