"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ListPlus, Check, X, Loader2 } from 'lucide-react'
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type Anime, type UserAnimeList } from "@/lib/types"

interface AnimeListPopoverProps {
  anime: Anime
}

export function AnimeListPopover({ anime }: AnimeListPopoverProps) {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [userListItem, setUserListItem] = useState<UserAnimeList | null>(null)
  const [status, setStatus] = useState<string>("planned")
  const [score, setScore] = useState<number | undefined>(undefined)
  const [episodesWatched, setEpisodesWatched] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    const fetchUserListItem = async () => {
      if (!session?.user) {
        setUserListItem(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("user_anime_lists")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("anime_id", anime.id)
        .single()

      if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
        console.error("Error fetching user list item:", error.message)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить статус аниме.",
          variant: "destructive",
        })
      } else if (data) {
        setUserListItem(data)
        setStatus(data.status || "planned")
        setScore(data.score || undefined)
        setEpisodesWatched(data.episodes_watched || 0)
      } else {
        setUserListItem(null)
        setStatus("planned")
        setScore(undefined)
        setEpisodesWatched(0)
      }
      setIsLoading(false)
    }

    if (isPopoverOpen) { // Only fetch when popover opens
      fetchUserListItem()
    }
  }, [anime.id, session, supabase, toast, isPopoverOpen])

  const handleSave = async () => {
    if (!session?.user) {
      toast({
        title: "Ошибка",
        description: "Вы должны быть авторизованы для добавления в список.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const now = new Date().toISOString()

    const itemData = {
      user_id: session.user.id,
      anime_id: anime.id,
      status,
      score: score || null,
      episodes_watched: episodesWatched,
      updated_at: now,
    }

    let error = null
    if (userListItem) {
      const { error: updateError } = await supabase
        .from("user_anime_lists")
        .update(itemData)
        .eq("id", userListItem.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("user_anime_lists")
        .insert({ ...itemData, created_at: now })
      error = insertError
    }

    setIsSaving(false)
    if (error) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешно",
        description: "Статус аниме обновлен.",
      })
      router.refresh() // Revalidate data on profile/lists page
      setIsPopoverOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!session?.user || !userListItem) return

    setIsSaving(true)
    const { error } = await supabase
      .from("user_anime_lists")
      .delete()
      .eq("id", userListItem.id)

    setIsSaving(false)
    if (error) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешно",
        description: "Аниме удалено из списка.",
      })
      setUserListItem(null)
      setStatus("planned")
      setScore(undefined)
      setEpisodesWatched(0)
      router.refresh()
      setIsPopoverOpen(false)
    }
  }

  const handleEpisodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setEpisodesWatched(Math.min(value, anime.episodes_total || Infinity))
    } else if (e.target.value === "") {
      setEpisodesWatched(0)
    }
  }

  const handleScoreChange = (value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      setScore(numValue)
    } else if (value === "") {
      setScore(undefined)
    }
  }

  if (!session?.user) {
    return (
      <Button variant="secondary" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 text-white">
        <Link href="/login">
          <ListPlus className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 text-white">
          {userListItem ? <Check className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800 border-slate-700 text-white">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Добавить в список</h4>
            <p className="text-sm text-muted-foreground">
              {anime.title}
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="status" className="text-slate-300">Статус</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="col-span-2 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="watching">Смотрю</SelectItem>
                    <SelectItem value="planned">Запланировано</SelectItem>
                    <SelectItem value="completed">Просмотрено</SelectItem>
                    <SelectItem value="dropped">Брошено</SelectItem>
                    <SelectItem value="on_hold">Отложено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="episodes" className="text-slate-300">Эпизоды</Label>
                <Input
                  id="episodes"
                  type="number"
                  value={episodesWatched}
                  onChange={handleEpisodesChange}
                  min={0}
                  max={anime.episodes_total || undefined}
                  className="col-span-2 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="score" className="text-slate-300">Оценка (0-10)</Label>
                <Input
                  id="score"
                  type="number"
                  value={score === undefined ? "" : score}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  min={0}
                  max={10}
                  className="col-span-2 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex justify-between mt-4">
                {userListItem && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                    Удалить
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white ml-auto"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
