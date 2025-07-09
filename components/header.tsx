"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Menu, X, Loader2, Bell, LogOut, Settings, Heart, User } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"

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
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  // Получение пользователя
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Подписка на изменения аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const getUserInitials = (user: SupabaseUser) => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.charAt(0).toUpperCase() || "U"
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

          {/* Правая часть с профилем, уведомлениями и меню */}
          <div className="flex items-center space-x-3 flex-shrink-0 ml-12">
            {!loading && (
              <>
                {user ? (
                  // Авторизованный пользователь
                  <>
                    {/* Уведомления - только на десктопе */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden lg:flex text-gray-300 hover:text-white relative"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Button>

                    {/* Профиль пользователя */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                              alt={user.user_metadata?.full_name || user.email}
                            />
                            <AvatarFallback className="bg-slate-700 text-white">{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            {user.user_metadata?.full_name && (
                              <p className="font-medium text-white">{user.user_metadata.full_name}</p>
                            )}
                            <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 hover:text-white">
                          <User className="mr-2 h-4 w-4" />
                          <span>Профиль</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 hover:text-white">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Избранное</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 hover:text-white">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Настройки</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                          className="text-gray-300 hover:bg-slate-700 hover:text-white"
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Выйти</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  // Неавторизованный пользователь
                  <div className="hidden lg:flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" className="text-gray-300 hover:text-white">
                        Войти
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">Регистрация</Button>
                    </Link>
                  </div>
                )}
              </>
            )}

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

              {/* Мобильные ссылки */}
              <div className="pt-2 border-t border-slate-700">
                {user ? (
                  // Авторизованный пользователь
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                          alt={user.user_metadata?.full_name || user.email}
                        />
                        <AvatarFallback className="bg-slate-700 text-white">{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        {user.user_metadata?.full_name && (
                          <p className="font-medium text-white">{user.user_metadata.full_name}</p>
                        )}
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Профиль</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Избранное</span>
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Уведомления</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </button>
                  </>
                ) : (
                  // Неавторизованный пользователь
                  <>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Войти</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors py-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Регистрация</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
