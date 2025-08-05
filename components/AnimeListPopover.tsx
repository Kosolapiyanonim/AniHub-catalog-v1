"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Check, Minus } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AnimeListPopoverProps {
  animeId: number
}

export function AnimeListPopover({ animeId }: AnimeListPopoverProps) {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/lists?userId=${user.id}&animeId=${animeId}`)
        const data = await response.json()
        if (response.ok) {
          setCurrentStatus(data.status)
        } else {
          console.error("Failed to fetch list status:", data.error)
          setCurrentStatus(null)
        }
      } catch (error) {
        console.error("Error fetching list status:", error)
        setCurrentStatus(null)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [user, animeId, supabase])

  const handleAddToList = async (status: string) => {
    if (!user) {
      toast({
        title: "Необходимо войти",
        description: "Пожалуйста, войдите, чтобы добавлять аниме в список.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, animeId, status }),
      })

      if (response.ok) {
        setCurrentStatus(status)
        toast({
          title: "Успешно",
          description: `Аниме добавлено в список "${status}".`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Ошибка",
          description: errorData.error || "Не удалось добавить аниме в список.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при добавлении аниме в список.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/lists?userId=${user.id}&animeId=${animeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCurrentStatus(null)
        toast({
          title: "Успешно",
          description: "Аниме удалено из списка.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Ошибка",
          description: errorData.error || "Не удалось удалить аниме из списка.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении аниме из списка.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "watching":
        return "Смотрю"
      case "planned":
        return "Запланировано"
      case "completed":
        return "Просмотрено"
      case "dropped":
        return "Брошено"
      case "on_hold":
        return "Отложено"
      default:
        return "Добавить в список"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentStatus ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          disabled={loading}
        >
          {loading ? (
            "Загрузка..."
          ) : currentStatus ? (
            <>
              <Check className="h-4 w-4" /> {getStatusText(currentStatus)}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> {getStatusText(currentStatus)}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleAddToList("watching")}>Смотрю</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToList("planned")}>Запланировано</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToList("completed")}>Просмотрено</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToList("dropped")}>Брошено</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToList("on_hold")}>Отложено</DropdownMenuItem>
        {currentStatus && (
          <>
            <DropdownMenuItem onClick={handleRemoveFromList} className="text-red-500">
              <Minus className="h-4 w-4 mr-2" /> Удалить из списка
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
