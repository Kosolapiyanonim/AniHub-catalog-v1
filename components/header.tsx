"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { getLoginUrl, getRegisterUrl } from "@/lib/auth-utils"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bell, User, LogOut, Settings, Heart, Search, CheckCheck } from "lucide-react"
import { CommandPalette } from "./command-palette"
import { MobileMainMenuContent } from "./mobile-main-menu-content"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { useSearchStore } from "@/hooks/use-search-store"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<{ username: string | null } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { supabase, session, loading } = useSupabase()
  const user = session?.user ?? null

  const toggleSearch = useSearchStore((state) => state.toggle)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Load user profile
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/profile?userId=${user.id}`, { cache: "no-store" })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUserProfile(data))
        .catch(() => setUserProfile(null))
    } else {
      setUserProfile(null)
    }
  }, [user?.id])

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Вы вышли из аккаунта")
      router.push("/")
      router.refresh()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Ошибка при выходе")
    }
  }

  const getUserInitials = (user: SupabaseUser) => {
    const name = userProfile?.username || user.user_metadata?.full_name || user.email
    return name?.charAt(0).toUpperCase() || "U"
  }

  const getUserName = (user: SupabaseUser) => {
    return userProfile?.username || user.user_metadata?.full_name || user.email?.split("@")[0] || "Пользователь"
  }

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/10" : "bg-transparent border-b border-transparent"}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-display font-bold text-foreground hover:text-primary transition-colors">
            AniHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Каталог
            </Link>
            <Button
              variant="outline"
              className="h-9 text-sm text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              onClick={toggleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Поиск...</span>
              <span className="ml-2 sm:ml-4 text-xs bg-secondary rounded-md px-1.5 py-0.5 hidden md:inline">
                Ctrl+K
              </span>
            </Button>
            <Link href="/popular" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Популярное
            </Link>
          </nav>

          {/* Desktop Search Button (tablet) */}
          <div className="hidden md:flex lg:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
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
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/lists">
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
                <Link href={getLoginUrl(pathname)} passHref>
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href={getRegisterUrl(pathname)} passHref>
                  <Button size="sm">Регистрация</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 bg-background border-border">
                <MobileMainMenuContent onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CommandPalette />
    </>
  )
}
