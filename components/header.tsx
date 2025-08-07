"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, LogOut, Settings, Heart, Search, CheckCheck } from 'lucide-react'
import { CommandPalette } from "./command-palette"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"
import { useSearchStore } from "@/hooks/use-search-store"
import { ModeToggle } from "@/components/ui/mode-toggle" // Добавлен импорт ModeToggle
import { ApiStatus } from "@/components/api-status" // Добавлен импорт ApiStatus
import Image from "next/image" // Добавлен импорт Image

function NotificationsDropdown() {
  const [hasNotifications, setHasNotifications] = useState(true)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
            <CheckCheck className="w-3 h-3 mr-1" />
            Прочитать все
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-4 text-center text-sm text-muted-foreground">Пока нет новых уведомлений.</div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const toggleSearch = useSearchStore((state) => state.toggle)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggleSearch])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success("Вы вышли из аккаунта")
    router.refresh()
  }

  const getUserInitials = (user: SupabaseUser) => {
    const name = user.user_metadata?.full_name || user.email
    return name?.charAt(0).toUpperCase() || "U"
  }

  const getUserName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "Пользователь"
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/placeholder-logo.svg" width={32} height={32} alt="AniHub Logo" />
            <span className="text-xl font-bold text-white hover:text-purple-400 transition-colors">AniHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/catalog" className="text-sm font-medium hover:text-purple-400 transition-colors">
              Каталог
            </Link>
            <Button
              variant="outline"
              className="h-9 text-sm text-muted-foreground border-slate-700 hover:bg-slate-800"
              onClick={toggleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Поиск...</span>
              <span className="ml-2 sm:ml-4 text-xs bg-slate-700 rounded-sm px-1.5 py-0.5 hidden md:inline">
                Ctrl+K
              </span>
            </Button>
            <Link href="/popular" className="text-sm font-medium hover:text-purple-400 transition-colors">
              Популярное
            </Link>
            {user && (
              <Link href="/admin/parser" className="text-sm font-medium hover:text-purple-400 transition-colors">
                Парсер
              </Link>
            )}
          </nav>

          {/* Desktop Search Button (tablet) */}
          <div className="hidden md:flex lg:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModeToggle /> {/* Перемещен сюда */}
            <ApiStatus /> {/* Перемещен сюда */}
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block">
                  <NotificationsDropdown />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-sm">{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none truncate">{getUserName(user)}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}/lists`}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Мои списки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Настройки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login" passHref>
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button size="sm">Регистрация</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <CommandPalette />
    </>
  )
}
