"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAnime } from "@/lib/meilisearch-client"
import { useSearchStore } from "@/hooks/use-search-store"
import type { Anime } from "@/lib/types"

export function CommandPalette() {
  const router = useRouter()
  const { searchDialogOpen, closeSearchDialog } = useSearchStore()
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim() === "") {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const searchResults = await searchAnime(debouncedQuery, 10)
        setResults(searchResults)
      } catch (error) {
        console.error("Error fetching search results:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (id: number) => {
      router.push(`/anime/${id}`)
      closeSearchDialog()
      setQuery("")
      setResults([])
    },
    [router, closeSearchDialog],
  )

  return (
    <CommandDialog open={searchDialogOpen} onOpenChange={closeSearchDialog}>
      <CommandInput
        placeholder="Поиск аниме..."
        value={query}
        onValueChange={setQuery}
        leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
      />
      <CommandList>
        {loading && query.trim() !== "" && <CommandEmpty>Загрузка результатов...</CommandEmpty>}
        {!loading && query.trim() !== "" && results.length === 0 && <CommandEmpty>Ничего не найдено.</CommandEmpty>}
        {results.length > 0 && (
          <CommandGroup heading="Результаты поиска">
            {results.map((anime) => (
              <CommandItem
                key={anime.id}
                value={anime.title}
                onSelect={() => handleSelect(anime.id)}
                className="flex items-center gap-2"
              >
                {anime.poster_url && (
                  <img
                    src={anime.poster_url || "/placeholder.svg"}
                    alt={anime.title}
                    className="h-8 w-8 object-cover rounded-sm"
                  />
                )}
                <span>{anime.title}</span>
                {anime.year && <span className="text-xs text-muted-foreground">({anime.year})</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
