"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Check, Eye, Heart, Bookmark, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { cn } from "@/lib/utils"

interface AnimePageListButtonProps {
  animeId: number
  initialStatus?: string | null
}

export function AnimePageListButton({ animeId, initialStatus = null }: AnimePageListButtonProps) {
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialStatus)
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
        body: JSON.stringify({ animeId, status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentStatus(data.status)
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
        return <Eye className="mr-2 h-4 w-4" />
      case "completed":
        return <Check className="mr-2 h-4 w-4" />
      case "planned":
        return <Bookmark className="mr-2 h-4 w-4" />
      case "dropped":
        return <X className="mr-2 h-4 w-4" />
      case "on_hold":
        return <Heart className="mr-2 h-4 w-4" />
      default:
        return <Plus className="mr-2 h-4 w-4" />
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className={cn(
            "w-full transition-all duration-200",
            currentStatus
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
          )}
          disabled={loading}
          aria-label={getStatusText(currentStatus)}
        >
          {getStatusIcon(currentStatus)}
          {getStatusText(currentStatus)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={() => handleStatusChange("watching")}>
          <Eye className="mr-2 h-4 w-4" /> Смотрю
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
          <Check className="mr-2 h-4 w-4" /> Просмотрено
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("planned")}>
          <Bookmark className="mr-2 h-4 w-4" /> В планах
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("on_hold")}>
          <Heart className="mr-2 h-4 w-4" /> Отложено
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("dropped")}>
          <X className="mr-2 h-4 w-4" /> Брошено
        </DropdownMenuItem>
        {currentStatus && (
          <>
            <DropdownMenuItem onClick={() => handleStatusChange(null)}>
              <X className="mr-2 h-4 w-4" /> Удалить из списка
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
