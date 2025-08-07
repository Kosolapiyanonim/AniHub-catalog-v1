'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Heart, Plus, List, Check, X, Clock, Bookmark, Star } from 'lucide-react'
import { Anime, AnimeListStatus } from '@/lib/types'
import { useAnimeListStatus } from '@/hooks/use-anime-list-status'
import { toast } from 'sonner'

interface AnimeListPopoverProps {
  anime: Anime
}

export function AnimeListPopover({ anime }: AnimeListPopoverProps) {
  const { status, score, episodesWatched, updateStatus, updateScore, updateEpisodesWatched, isLoading } = useAnimeListStatus(anime.id)
  const [open, setOpen] = useState(false)

  const handleStatusChange = async (newStatus: AnimeListStatus) => {
    const success = await updateStatus(newStatus)
    if (success) {
      toast.success(`Аниме "${anime.title}" добавлено в "${getStatusLabel(newStatus)}"`)
    } else {
      toast.error(`Не удалось обновить статус для "${anime.title}"`)
    }
  }

  const handleScoreChange = async (newScore: number) => {
    const success = await updateScore(newScore)
    if (success) {
      toast.success(`Оценка для "${anime.title}" обновлена на ${newScore}`)
    } else {
      toast.error(`Не удалось обновить оценку для "${anime.title}"`)
    }
  }

  const handleEpisodesWatchedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEpisodes = parseInt(e.target.value)
    if (!isNaN(newEpisodes) && newEpisodes >= 0) {
      const success = await updateEpisodesWatched(newEpisodes)
      if (success) {
        toast.success(`Просмотрено эпизодов для "${anime.title}" обновлено на ${newEpisodes}`)
      } else {
        toast.error(`Не удалось обновить количество просмотренных эпизодов для "${anime.title}"`)
      }
    }
  }

  const getStatusLabel = (s: AnimeListStatus) => {
    switch (s) {
      case 'watching': return 'Смотрю'
      case 'completed': return 'Просмотрено'
      case 'planned': return 'Запланировано'
      case 'dropped': return 'Брошено'
      case 'on_hold': return 'Отложено'
      case 'favorite': return 'Избранное'
      default: return 'Добавить в список'
    }
  }

  const getStatusIcon = (s: AnimeListStatus | null) => {
    switch (s) {
      case 'watching': return <Clock className="h-4 w-4" />
      case 'completed': return <Check className="h-4 w-4" />
      case 'planned': return <Bookmark className="h-4 w-4" />
      case 'dropped': return <X className="h-4 w-4" />
      case 'on_hold': return <List className="h-4 w-4" />
      case 'favorite': return <Heart className="h-4 w-4 fill-red-500 text-red-500" />
      default: return <Plus className="h-4 w-4" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-purple-400" disabled={isLoading}>
          {getStatusIcon(status)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-slate-900 border-slate-700 text-white">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Мой список</h4>
            <p className="text-sm text-muted-foreground">Управляйте статусом и оценкой аниме.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="status" className="text-slate-300">Статус</Label>
              <Select value={status || ''} onValueChange={handleStatusChange} disabled={isLoading}>
                <SelectTrigger id="status" className="col-span-2 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Выбрать статус" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="watching">Смотрю</SelectItem>
                  <SelectItem value="completed">Просмотрено</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="dropped">Брошено</SelectItem>
                  <SelectItem value="on_hold">Отложено</SelectItem>
                  <SelectItem value="favorite">Избранное</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="score" className="text-slate-300">Оценка</Label>
              <Select value={score?.toString() || ''} onValueChange={(val) => handleScoreChange(parseInt(val))} disabled={isLoading}>
                <SelectTrigger id="score" className="col-span-2 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Оценить" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="episodes" className="text-slate-300">Эпизоды</Label>
              <Input
                id="episodes"
                type="number"
                value={episodesWatched || 0}
                onChange={handleEpisodesWatchedChange}
                className="col-span-2 bg-slate-800 border-slate-700 text-white"
                min="0"
                max={anime.episodes_count || 9999}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
