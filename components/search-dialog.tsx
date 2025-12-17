'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useSearchStore } from "@/hooks/use-search-store"
import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAnime } from "@/lib/anime-api"
import { CatalogAnime } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export function SearchDialog() {
  const { isOpen, close } = useSearchStore()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [searchResults, setSearchResults] = useState<CatalogAnime[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.trim() === "") {
        setSearchResults([])
        return
      }
      setIsLoading(true)
      try {
        const response = await searchAnime(debouncedSearchQuery)
        setSearchResults(response.results)
      } catch (error) {
        console.error("Failed to fetch search results:", error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchQuery])

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
        <Command className="rounded-lg border shadow-md flex-grow flex flex-col">
          <CommandInput
            placeholder="Поиск аниме..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList className="flex-grow overflow-y-auto">
            {isLoading && (
              <CommandEmpty>Загрузка...</CommandEmpty>
            )}
            {!isLoading && searchResults.length === 0 && debouncedSearchQuery.trim() !== "" && (
              <CommandEmpty>Ничего не найдено.</CommandEmpty>
            )}
            {!isLoading && searchResults.length === 0 && debouncedSearchQuery.trim() === "" && (
              <CommandEmpty>Начните вводить для поиска аниме.</CommandEmpty>
            )}
            <CommandGroup heading="Результаты поиска">
              {searchResults.map((anime) => (
                <Link href={`/anime/${anime.shikimori_id}`} key={anime.id} onClick={close}>
                  <CommandItem className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <Image
                      src={anime.poster_url || "/placeholder.svg"}
                      alt={anime.title || "Anime poster"}
                      width={48}
                      height={64}
                      className="rounded object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{anime.title}</span>
                      {anime.genres && anime.genres.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {anime.genres.join(", ")}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
