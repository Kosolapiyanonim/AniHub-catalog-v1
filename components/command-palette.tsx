'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSearchStore } from '@/hooks/use-search-store'
import { useDebounce } from '@/hooks/use-debounce'
import { CatalogAnime } from '@/lib/types'
import Image from 'next/image'

export function CommandPalette() {
  const router = useRouter()
  const { isOpen, toggle, close } = useSearchStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [searchResults, setSearchResults] = React.useState<CatalogAnime[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (debouncedSearchQuery.length > 2) { // Only search if query is at least 3 characters
      setLoading(true)
      const fetchResults = async () => {
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchQuery)}`)
          const data = await response.json()
          setSearchResults(data.results || [])
        } catch (error) {
          console.error('Failed to fetch search results:', error)
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      }
      fetchResults()
    } else {
      setSearchResults([])
      setLoading(false)
    }
  }, [debouncedSearchQuery])

  const handleSelect = (path: string) => {
    router.push(path)
    close()
    setSearchQuery('') // Clear search query after selection
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={toggle}>
      <CommandInput
        placeholder="Поиск аниме, жанров, студий..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        icon={<Search className="h-4 w-4" />}
      />
      <CommandList>
        {loading && <CommandEmpty>Загрузка результатов...</CommandEmpty>}
        {!loading && searchResults.length === 0 && debouncedSearchQuery.length > 2 && (
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
        )}
        {!loading && searchResults.length === 0 && debouncedSearchQuery.length <= 2 && (
          <CommandEmpty>Введите минимум 3 символа для поиска.</CommandEmpty>
        )}

        {searchResults.length > 0 && (
          <CommandGroup heading="Аниме">
            {searchResults.map((anime) => (
              <CommandItem
                key={anime.id}
                value={anime.title}
                onSelect={() => handleSelect(`/anime/${anime.id}`)}
                className="flex items-center gap-2"
              >
                <Image
                  src={anime.poster_url || '/placeholder.svg?height=48&width=32&text=No+Poster'}
                  alt={anime.title}
                  width={32}
                  height={48}
                  className="rounded object-cover"
                />
                <div>
                  <p className="font-medium">{anime.title}</p>
                  {anime.title_orig && <p className="text-xs text-muted-foreground">{anime.title_orig}</p>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
