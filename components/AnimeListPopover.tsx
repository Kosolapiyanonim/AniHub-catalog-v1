'use client'

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAnimeListStatus } from '@/hooks/use-anime-list-status'
import { toast } from 'sonner'

interface AnimeListPopoverProps {
  animeId: string
  userId: string
  children: React.ReactNode
}

export function AnimeListPopover({ animeId, userId, children }: AnimeListPopoverProps) {
  const { statuses, loading, toggleStatus } = useAnimeListStatus(userId, animeId)

  const handleToggle = async (listName: string, isChecked: boolean) => {
    const success = await toggleStatus(listName, isChecked)
    if (success) {
      toast.success(`Аниме ${isChecked ? 'добавлено в' : 'удалено из'} списка "${listName}"`)
    } else {
      toast.error(`Не удалось обновить список "${listName}"`)
    }
  }

  if (loading) {
    return <Button variant="ghost" size="icon" disabled>...</Button>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="grid gap-2">
          <Label className="text-sm font-medium leading-none">Мои списки</Label>
          <div className="space-y-2">
            {Object.entries(statuses).map(([listName, isChecked]) => (
              <div key={listName} className="flex items-center space-x-2">
                <Checkbox
                  id={`list-${listName}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggle(listName, checked as boolean)}
                />
                <label
                  htmlFor={`list-${listName}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {listName}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
