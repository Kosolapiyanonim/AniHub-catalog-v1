"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import Image from "next/image"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface AnimeSearchResult {
  id: number
  shikimori_id: string
  title: string
  title_orig: string | null
  poster_url: string | null
  year: number | null
  type: string | null
}

export function HeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [results, setResults] = useState<AnimeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchQuery.length < 2) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(debouncedSearchQuery)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("Failed to fetch search results:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchQuery])

  const handleSelect = () => {
    setOpen(false)
    setSearchQuery("") // Clear search query after selection
    if (inputRef.current) {
      inputRef.current.blur() // Remove focus from input
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex items-center w-full max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Поиск аниме..."
            className="pl-9 pr-3 py-2 rounded-md bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setOpen(true)}
          />
          <VisuallyHidden>Поле поиска аниме</VisuallyHidden>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-slate-800 border-slate-700 text-white">
        <Command>
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Поиск аниме..."
            className="h-9 bg-slate-800 border-b border-slate-700 text-white placeholder-gray-400"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading && <CommandEmpty>Загрузка...</CommandEmpty>}
            {!loading && results.length === 0 && debouncedSearchQuery.length >= 2 && (
              <CommandEmpty>Ничего не найдено.</CommandEmpty>
            )}
            {!loading && debouncedSearchQuery.length < 2 && (
              <CommandEmpty>Введите минимум 2 символа для поиска.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((anime) => (
                <Link key={anime.id} href={`/anime/${anime.shikimori_id}`} onClick={handleSelect}>
                  <CommandItem className="flex items-center gap-3 p-2 cursor-pointer hover:bg-slate-700">
                    <Image
                      src={anime.poster_url || "/placeholder.svg"}
                      alt={anime.title}
                      width={40}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm line-clamp-1">{anime.title}</span>
                      {anime.title_orig && (
                        <span className="text-xs text-gray-400 line-clamp-1">{anime.title_orig}</span>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {anime.year && <span>{anime.year}</span>}
                        {anime.type && <span>{anime.type.replace("_", " ")}</span>}
                      </div>
                    </div>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
