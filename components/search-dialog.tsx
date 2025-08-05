"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearchStore } from "@/hooks/use-search-store"
import Link from "next/link"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: number
  shikimori_id: number
  title: string
  russian: string
  poster_url: string
  type: string
  year: number
  shikimori_rating: number
}

export function SearchDialog() {
  const { isSearchDialogOpen, closeSearchDialog } = useSearchStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchDialogOpen) {
      // Focus the input when the dialog opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // Small delay to ensure dialog is rendered
    } else {
      // Clear search term and results when dialog closes
      setSearchTerm("")
      setSearchResults([])
    }
  }, [isSearchDialogOpen])

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm.trim() === "") {
        setSearchResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}&limit=10`)
        const data = await response.json()
        if (response.ok) {
          setSearchResults(data.results)
        } else {
          console.error("Error fetching search results:", data.error)
          setSearchResults([])
        }
      } catch (error) {
        console.error("Failed to fetch search results:", error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchTerm])

  const handleResultClick = () => {
    closeSearchDialog()
  }

  return (
    <Dialog open={isSearchDialogOpen} onOpenChange={closeSearchDialog}>
      <DialogContent className="p-0 max-w-lg w-full">
        <div className="relative flex items-center border-b px-4">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Поиск аниме..."
            className="w-full pl-10 pr-4 py-3 text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className={cn("max-h-[400px]", searchResults.length > 0 ? "py-2" : "py-0")}>
          {loading && searchTerm.trim() !== "" && (
            <div className="p-4 text-center text-muted-foreground">Загрузка...</div>
          )}
          {!loading && searchTerm.trim() !== "" && searchResults.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">Ничего не найдено.</div>
          )}
          {searchResults.length > 0 && (
            <div className="grid gap-2">
              {searchResults.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.shikimori_id}`}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
                  onClick={handleResultClick}
                >
                  <Image
                    src={anime.poster_url || "/placeholder.svg?height=64&width=42&query=anime poster"}
                    alt={anime.title || "Anime poster"}
                    width={42}
                    height={64}
                    className="rounded-sm object-cover aspect-[2/3]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{anime.russian || anime.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {anime.type} • {anime.year} • Рейтинг: {anime.shikimori_rating}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
