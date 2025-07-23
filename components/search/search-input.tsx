// src/components/search/search-input.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  AnimeSearchResult,
  SearchResults,
} from '@/components/search/search-results'
import { cn } from '@/lib/utils'

async function fetchSearchResults(query: string): Promise<AnimeSearchResult[]> {
  if (query.length < 2) return []

  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const { data } = await response.json()
  return data
}

export function SearchInput() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [debouncedQuery] = useDebounce(query, 500) // Задержка в 500ms перед запросом

  const searchRef = useRef<HTMLDivElement>(null)

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['animeSearch', debouncedQuery],
    query: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // Запрос активен только если введено 2+ символа
  })

  // Закрытие меню по клику вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClose = () => {
    setIsFocused(false)
    setQuery('')
  }

  const showResults = isFocused && query.length > 0

  return (
    <div className='relative w-full max-w-md' ref={searchRef}>
      <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='search'
        placeholder='Найти аниме...'
        className='w-full pl-10'
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
      />

      {showResults && (
        <div
          className={cn(
            'absolute top-full z-50 mt-2 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {isLoading && query.length > 0 && debouncedQuery.length >= 2 && (
            <div className='p-4 text-center text-sm text-muted-foreground'>
              Загрузка...
            </div>
          )}
          {!isLoading && <SearchResults results={results} onClose={handleClose} />}
        </div>
      )}
    </div>
  )
}
