// hooks/use-anime-list-status.ts

"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"

export function useAnimeListStatus(
  animeId: number,
  initialStatus?: string | null,
  onStatusChange?: (animeId: number, newStatus: string | null) => void,
) {
  const { supabase, session } = useSupabase()
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialStatus || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrentStatus(initialStatus || null)
  }, [initialStatus])

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!session) {
        toast.error("Нужно войти в аккаунт")
        return
      }

      setLoading(true)
      try {
        const response = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anime_id: animeId, status: newStatus }),
        })

        if (!response.ok) throw new Error("Server error")

        const newResolvedStatus = newStatus === "remove" ? null : newStatus
        setCurrentStatus(newResolvedStatus)
        if (onStatusChange) onStatusChange(animeId, newResolvedStatus)
        toast.success("Статус обновлен!")
      } catch (error) {
        toast.error("Не удалось обновить статус.")
      } finally {
        setLoading(false)
      }
    },
    [animeId, session, onStatusChange],
  )

  return { session, currentStatus, loading, handleStatusChange }
}
