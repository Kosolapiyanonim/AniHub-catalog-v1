"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
          const params = new URLSearchParams({ title: debouncedSearchQuery, limit: "8" })
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

  const handleInputFocus = () => {
    if (searchQuery.length > 2 && searchResults.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
            AniHub
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Главная
            </Link>

            {/* Большой поиск в центре */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative w-80">
                  <Input
                    type="text"
                    placeholder="Поиск аниме..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInputFocus}
                    className="pr-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <Search className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </form>

              {/* Большое выпадающее окно как на AnimeLib */}
              {isDropdownOpen && (
                <div className="absolute mt-2 w-[600px] -left-28 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-10 max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-purple-400 mb-2">AniHub</h3>
                        <div className="space-y-2">
                          {searchResults.map((anime) => (
                            <Link
                              key={anime.shikimori_id}
                              href={`/anime/${anime.shikimori_id}`}
                              className="flex items-center p-3 hover:bg-slate-700 rounded-md transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="w-12 h-16 flex-shrink-0 mr-4">
                                <Image
                                  src={anime.poster_url || "/placeholder.svg?height=64&width=48"}
                                  alt={anime.title}
                                  width={48}
                                  height={64}
                                  className="w-full h-full object-cover rounded"
                                  quality={60}
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white mb-1">{anime.title}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>Аниме</span>
                                  {anime.year && (
                                    <>
                                      <span>•</span>
                                      <span>{anime.year} г.</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    !isSearching &&
                    searchQuery.length > 2 && (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-400">Ничего не найдено</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
              Каталог
            </Link>
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
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
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
