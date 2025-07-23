// components/command-palette.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDebounce } from '@/hooks/use-debounce'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

// Типы и функции форматирования
interface AnimeSearchResult {
  shikimori_id: string
  title: string
  poster_url: string | null
  year: number | null
  type: string | null
  status: string | null
  raw_data: { material_data?: { aired_at?: string } }
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatType = (type: string | null) => {
  if (!type) return null
  if (type.includes('serial')) return 'Аниме сериал'
  if (type.includes('movie')) return 'Аниме фильм'
  return null
}

const formatStatus = (status: string | null) => {
  if (status === 'released') return 'Завершённое'
  if (status === 'ongoing') return 'Онгоинг'
  return null
}

const formatDate = (dateString?: string) => {
  if (!dateString) return null
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
  } catch { return null }
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setSearchTerm('')
      setSearchResults([])
      setTotal(0)
    }
  }, [open])

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults([])
        setTotal(0)
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchTerm)}`)
        const { data, total } = await response.json()
        setSearchResults(data || [])
        setTotal(total || 0)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedSearchTerm])

  const navigateToCatalog = () => {
    if (searchTerm.length < 2) return
    router.push(`/catalog?title=${encodeURIComponent(searchTerm)}`)
    onOpenChange(false)
  }

  const handleSelect = (shikimori_id: string) => {
    router.push(`/anime/${shikimori_id}`)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      navigateToCatalog()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[60vw] max-w-4xl h-[70vh] max-h-[800px] p-0'>
        <VisuallyHidden>
          <DialogTitle>Поиск по сайту</DialogTitle>
        </VisuallyHidden>
        <Command className='flex h-full flex-col'>
          <CommandInput
            placeholder='Название аниме...'
            value={searchTerm}
            onValueChange={setSearchTerm}
            onKeyDown={handleKeyDown}
          />
          {/* // <-- [ИЗМЕНЕНИЕ] Убираем ограничение по высоте у списка */}
          <CommandList className='flex-1 max-h-none'>
            {loading && <CommandEmpty>Загрузка...</CommandEmpty>}
            {!loading && searchResults.length === 0 && searchTerm.length > 1 && <CommandEmpty>Ничего не найдено.</CommandEmpty>}
            <CommandGroup heading='Результаты поиска'>
              {searchResults.map(anime => {
                const typeText = formatType(anime.type)
                const statusText = formatStatus(anime.status)
                const airedText = formatDate(anime.raw_data?.material_data?.aired_at)

                return (
                  <CommandItem
                    key={anime.shikimori_id}
                    value={anime.title}
                    onSelect={() => handleSelect(anime.shikimori_id)}
                    className='flex items-center gap-4 cursor-pointer p-3'
                  >
                    <div className='relative h-16 w-12 flex-shrink-0'>
                      <Image
                        src={anime.poster_url || '/placeholder.png'}
                        alt={anime.title}
                        fill
                        className='rounded-md object-cover'
                      />
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium line-clamp-1'>{anime.title}</p>
                      <div className='text-sm text-muted-foreground flex items-center flex-wrap gap-x-2.5 mt-1'>
                        {typeText && <span>{typeText}</span>}
                        {statusText && <span className='text-purple-400 font-medium'>• {statusText}</span>}
                        {airedText && <span>• {airedText}</span>}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            
            {!loading && total > 8 && searchResults.length > 0 && (
                <CommandItem 
                  onSelect={navigateToCatalog}
                  className='justify-center text-sm text-purple-400 cursor-pointer sticky bottom-0 bg-popover'
                >
                  Показать все {total} результатов в каталоге
                </CommandItem>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
