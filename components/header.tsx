"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, Loader2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface AnimeSearchResult {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string
  year?: number
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const router = useRouter()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.length > 2) {
        setIsSearching(true)
        try {
          const params = new URLSearchParams({ title: debouncedSearchQuery, limit: "5" })
          const response = await fetch(`/api/catalog?${params.toString()}`)
          const data = await response.json()
          setSearchResults(data.results || [])
          setIsDropdownOpen(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setIsDropdownOpen(false)
      }
    }
    performSearch()
  }, [debouncedSearchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?title=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsDropdownOpen(false)
    }
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
            AniHub
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Главная
            </Link>
            <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
              Каталог
            </Link>
          </nav>

          {/* Блок поиска */}
          <div ref={searchRef} className="hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Поиск аниме..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 2 && setIsDropdownOpen(true)}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </form>

            {isDropdownOpen && (
              <div className="absolute mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <ul className="p-2">
                    {searchResults.map((anime) => (
                      <li key={anime.shikimori_id}>
                        <Link
                          href={`/anime/${anime.shikimori_id}`}
                          className="flex items-center p-2 rounded-md hover:bg-slate-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Image
                            src={anime.poster_url || "/placeholder.png"}
                            alt={anime.title}
                            width={40}
                            height={60}
                            className="w-10 h-auto object-cover rounded-sm mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white truncate">{anime.title}</p>
                            <p className="text-xs text-slate-400">{anime.year}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !isSearching && <p className="p-4 text-sm text-center text-gray-400">Ничего не найдено</p>
                )}
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Главная
              </Link>
              <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                Каталог
              </Link>
              <div className="pt-2">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="text"
                    placeholder="Поиск аниме..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </form>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
