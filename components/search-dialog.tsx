"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AnimeCard } from "./anime-card"
import { searchAnime } from "@/lib/anime-api"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      handleSearch(debouncedQuery)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  const handleSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const searchResults = await searchAnime(searchQuery)
      setResults(searchResults.slice(0, 6))
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
      setQuery("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Поиск аниме</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Введите название аниме..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={!query.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((anime: any) => (
                <div key={anime.id} onClick={() => onOpenChange(false)}>
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          )}

          {debouncedQuery.length > 2 && !loading && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Ничего не найдено</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
