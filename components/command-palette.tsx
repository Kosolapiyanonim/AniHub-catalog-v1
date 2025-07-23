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
import { DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

// --- [ИЗМЕНЕНИЕ] Обновляем тип для новых полей ---
interface AnimeSearchResult {
  shikimori_id: string
  title: string
  poster_url: string | null
  year: number | null
  type: string | null
  status: string | null
  raw_data: {
    material_data?: {
      aired_at?: string
    }
  }
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// --- [ИЗМЕНЕНИЕ] Вспомогательные функции для форматирования данных ---
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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([])
  const [total, setTotal] = useState(0) // <--- [ИЗМЕНЕНИЕ] Состояние для общего количества
  const [loading, setLoading] = useState(false)

  // Получение данных с новым ответом от API
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
        const { data, total } = await response.json() // <--- [ИЗМЕНЕНИЕ] Получаем и data, и total
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

  // --- [ИЗМЕНЕНИЕ] Новая логика для Enter ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Предотвращаем стандартное поведение cmdk (выбор первого элемента)
      e.preventDefault() 
      navigateToCatalog()
    }
  }

  const handleSelect = (shikimori_id: string) => {
    router.push(`/anime/${shikimori_id}`)
    onOpenChange(false)
  }

  return (
    // --- [ИЗМЕНЕНИЕ] Увеличиваем ширину диалогового окна ---
    <CommandDialog open={open} onOpenChange={onOpenChange} dialogProps={{ contentClassName: 'max-w-2xl' }}>
      <VisuallyHidden>
        <DialogTitle>Поиск по сайту</DialogTitle>
      </VisuallyHidden>
      <CommandInput
        placeholder='Начните вводить название аниме...'
        value={searchTerm}
        onValueChange={setSearchTerm}
        onKeyDown={handleKeyDown} // <--- [ИЗМЕНЕНИЕ] Добавляем обработчик нажатий
      />
      <CommandList>
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
                <div className='relative h-[72px] w-12 flex-shrink-0'>
                  <Image
                    src={anime.poster_url || '/placeholder.png'}
                    alt={anime.title}
                    fill
                    className='rounded-md object-cover'
                  />
                </div>
                <div className='flex-1'>
                  <p className='font-medium line-clamp-1'>{anime.title}</p>
                  {/* --- [ИЗМЕНЕНИЕ] Вывод дополнительной информации --- */}
                  <div className='text-xs text-muted-foreground flex items-center flex-wrap gap-x-2.5 mt-1'>
                    {typeText && <span>{typeText}</span>}
                    {statusText && <span className='text-purple-400 font-medium'>• {statusText}</span>}
                    {airedText && <span>• {airedText}</span>}
                  </div>
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
        
        {/* --- [ИЗМЕНЕНИЕ] Кнопка "Показать еще" --- */}
        {!loading && total > 8 && searchResults.length > 0 && (
            <CommandItem 
              onSelect={navigateToCatalog}
              className='justify-center text-sm text-purple-400 cursor-pointer'
            >
              Показать все {total} результатов
            </CommandItem>
        )}
      </CommandList>
    </CommandDialog>
  )
}
