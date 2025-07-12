"use client"

import type React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

/**
 * Button rendered on an AnimeCard to add the title to the
 * authenticated user’s personal list / favourites.
 */
export function AddToListButtonOnCard({
  animeId,
}: {
  animeId: string | number
}) {
  const supabase = useSupabase()
  const { toast } = useToast()

  async function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()

    if (!supabase) {
      toast({
        title: "Not signed in",
        description: "Please log in to save titles to your list.",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("user_anime_list").upsert({ anime_id: animeId })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Added!",
        description: "This anime is now in your list.",
      })
    }
  }

  return (
    <Button size="icon" variant="ghost" aria-label="Add to list" onClick={handleAdd}>
      <Plus className="h-4 w-4" />
      <span className="sr-only">Add to list</span>
    </Button>
  )
}

export default AddToListButtonOnCard
