"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus, Check, Eye, Heart, Bookmark, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import type { Anime } from "@/lib/types"

interface AnimeListPopoverProps {
  anime: Anime
  children: React.ReactNode
  onStatusChange?: (animeId: number, newStatus: string | null) => void
}

export function AnimeListPopover({ anime, children, onStatusChange }: AnimeListPopoverProps) {
  const [currentStatus, setCurrentStatus] = useState<string | null>(anime.user_list_status || null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useSupabase()

  const handleStatusChange = async (newStatus: string | null) => {
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
        body: JSON.stringify({ animeId: anime.id, status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentStatus(data.status)
        onStatusChange?.(anime.id, data.status)
        toast({
          title: "Успех",
          description: data.message,
        })
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось обновить список.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: `Произошла ошибка: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "watching":
        return <Eye className="h-4 w-4" />
      case "completed":
        return <Check className="h-4 w-4" />
      case "planned":
        return <Bookmark className="h-4 w-4" />
      case "dropped":
        return <X className="h-4 w-4" />
      case "on_hold":
        return <Heart className="h-4 w-4" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "watching":
        return "Смотрю"
      case "completed":
        return "Просмотрено"
      case "planned":
        return "В планах"
      case "dropped":
        return "Брошено"
      case "on_hold":
        return "Отложено"
      default:
        return "Добавить в список"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleStatusChange("watching")}
            disabled={loading}
          >
            <Eye className="mr-2 h-4 w-4" /> Смотрю
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleStatusChange("completed")}
            disabled={loading}
          >
            <Check className="mr-2 h-4 w-4" /> Просмотрено
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleStatusChange("planned")}
            disabled={loading}
          >
            <Bookmark className="mr-2 h-4 w-4" /> В планах
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleStatusChange("on_hold")}
            disabled={loading}
          >
            <Heart className="mr-2 h-4 w-4" /> Отложено
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleStatusChange("dropped")}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" /> Брошено
          </Button>
          {currentStatus && (
            <Button
              variant="ghost"
              className="justify-start text-destructive hover:text-destructive"
              onClick={() => handleStatusChange(null)}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" /> Удалить из списка
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
