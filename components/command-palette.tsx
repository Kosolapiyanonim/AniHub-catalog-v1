// components/command-palette.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDebounce } from '@/hooks/use-debounce'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

// Тип для результатов поиска
interface AnimeSearchResult {
  shikimori_id: string
  title: string
  poster_url: string | null
  year: number | null
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Задержка в 300мс
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Горячие клавиши Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Логика получения данных
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchTerm)}`)
        const { data } = await response.json()
        setSearchResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedSearchTerm])

  // Действие при выборе аниме
  const handleSelect = (shikimori_id: string) => {
    router.push(`/anime/${shikimori_id}`)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder='Начните вводить название аниме...'
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        {loading && <CommandEmpty>Загрузка...</CommandEmpty>}
        {!loading && searchResults.length === 0 && searchTerm.length > 1 && <CommandEmpty>Ничего не найдено.</CommandEmpty>}
        <CommandGroup heading='Результаты поиска'>
          {searchResults.map(anime => (
            <CommandItem
              key={anime.shikimori_id}
              value={anime.title}
              onSelect={() => handleSelect(anime.shikimori_id)}
              className='flex items-center gap-3 cursor-pointer'
            >
              <div className='relative h-12 w-9 flex-shrink-0'>
                <Image
                  src={anime.poster_url || '/placeholder.png'}
                  alt={anime.title}
                  fill
                  className='rounded-sm object-cover'
                />
              </div>
              <div>
                <p className='font-medium'>{anime.title}</p>
                {anime.year && <p className='text-xs text-muted-foreground'>{anime.year}</p>}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
