"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X, Loader2, Bell, User } from "lucide-react"
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

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (searchQuery.length > 2 && searchResults.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип слева с увеличенным отступом */}
          <div className="flex-shrink-0 mr-12">
            <Link href="/" className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
              AniHub
            </Link>
          </div>

          {/* Центральная навигация с поиском */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-4xl">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                Главная
              </Link>

              {/* Увеличенный поиск в центре */}
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative w-96">
                    <Input
                      type="text"
                      placeholder="Поиск аниме..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleInputFocus}
                      onClick={handleInputClick}
                      className="pr-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 cursor-text"
                      autoComplete="off"
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

                {/* Увеличенное выпадающее окно с адаптивными отступами от экрана */}
                {isDropdownOpen && (
                  <div
                    className="fixed left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-10 overflow-y-auto"
                    style={{
                      width: "775px",
                      maxWidth: "95vw",
                      top: "4.5rem",
                      maxHeight: "calc(100vh - 6rem)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {searchResults.length > 0 ? (
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-purple-400 mb-3">AniHub</h3>
                          <div className="space-y-2">
                            {searchResults.map((anime) => (
                              <Link
                                key={anime.shikimori_id}
                                href={`/anime/${anime.shikimori_id}`}
                                className="flex items-center p-3 hover:bg-slate-700 rounded-md transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="w-14 h-20 flex-shrink-0 mr-4">
                                  <Image
                                    src={anime.poster_url || "/placeholder.svg?height=80&width=56"}
                                    alt={anime.title}
                                    width={56}
                                    height={80}
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

              <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                Каталог
              </Link>
            </div>
          </div>

          {/* Правая часть с профилем, уведомлениями и меню с увеличенным отступом */}
          <div className="flex items-center space-x-3 flex-shrink-0 ml-12">
            {/* Уведомления - только на десктопе */}
            <Button variant="ghost" size="sm" className="hidden lg:flex text-gray-300 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Аватарка профиля - только на десктопе */}
            <Button variant="ghost" size="sm" className="hidden lg:flex text-gray-300 hover:text-white">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </Button>

            {/* Бургер меню */}
            <Button variant="ghost" size="sm" className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="py-4 border-t border-slate-800">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Главная
              </Link>
              <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                Каталог
              </Link>

              {/* Мобильный поиск */}
              <div className="lg:hidden pt-2">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="text"
                    placeholder="Поиск аниме..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                    autoComplete="off"
                  />
                </form>
              </div>

              {/* Мобильные ссылки профиля */}
              <div className="lg:hidden pt-2 border-t border-slate-700">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                >
                  <User className="w-4 h-4" />
                  <span>Профиль</span>
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Уведомления</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
