"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getLoginUrl, getRegisterUrl } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Bell, User, LogOut, Settings, Heart, Search, CheckCheck, Newspaper, Users, ArrowRightToLine } from "lucide-react"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import { useSearchStore } from "@/hooks/use-search-store"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MobileMainMenuContentProps {
  onClose: () => void
}

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

export function MobileMainMenuContent({ onClose }: MobileMainMenuContentProps) {
  const [userProfile, setUserProfile] = useState<{ username: string | null } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { supabase, session } = useSupabase()
  const user = session?.user ?? null
  const toggleSearch = useSearchStore((state) => state.toggle)

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/profile?userId=${user.id}`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUserProfile(data))
        .catch(() => setUserProfile(null))
    } else {
      setUserProfile(null)
    }
  }, [user?.id])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Вы вышли из аккаунта")
      router.push("/")
      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Ошибка при выходе")
    }
  }

  const getUserName = (currentUser: SupabaseUser) => {
    return userProfile?.username || currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Пользователь"
  }

  return (
    <>
      <SheetHeader className="px-6 pt-6">
        <SheetTitle className="text-left text-foreground font-display flex items-center gap-2">
          <Menu className="h-4 w-4" /> Меню
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-col space-y-4 mt-4 px-6 pb-6">
        <Button
          variant="outline"
          className="justify-start h-12 border-border hover:bg-secondary"
          onClick={() => {
            toggleSearch()
            onClose()
          }}
        >
          <Search className="mr-3 h-5 w-5" />
          Поиск аниме
        </Button>

        <Link
          href="/news"
          className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
          onClick={onClose}
        >
          <Newspaper className="mr-3 h-5 w-5" />
          Новости
        </Link>

        <Link
          href="/menu"
          className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
          onClick={onClose}
        >
          <Users className="mr-3 h-5 w-5" />
          Сообщество
        </Link>

        <Link
          href="/popular"
          className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
          onClick={onClose}
        >
          <Heart className="mr-3 h-5 w-5" />
          Популярное
        </Link>

        {user ? (
          <div className="pt-4 border-t border-border space-y-2">
            <div className="px-2 py-2">
              <p className="text-sm font-medium text-foreground truncate">{getUserName(user)}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            <Link
              href="/profile"
              className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              onClick={onClose}
            >
              <User className="mr-3 h-5 w-5" />
              Профиль
            </Link>

            <Link
              href="/profile/lists"
              className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              onClick={onClose}
            >
              <Heart className="mr-3 h-5 w-5" />
              Мои списки
            </Link>

            <Link
              href="/settings"
              className="flex items-center py-3 px-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              onClick={onClose}
            >
              <Settings className="mr-3 h-5 w-5" />
              Настройки
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center py-3 px-2 w-full text-left text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Выйти
            </button>

            <div className="sm:hidden pt-2">
              <NotificationsDropdown />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-border space-y-2">
            <Link href={getLoginUrl(pathname)} onClick={onClose}>
              <Button variant="outline" className="w-full justify-start h-12 border-border">
                <User className="mr-3 h-5 w-5" />
                Войти
              </Button>
            </Link>
            <Link href={getRegisterUrl(pathname)} onClick={onClose}>
              <Button className="w-full justify-start h-12">
                <User className="mr-3 h-5 w-5" />
                Регистрация
              </Button>
            </Link>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-auto flex items-center py-3 px-2 w-full text-left text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRightToLine className="mr-3 h-5 w-5" />
          Закрыть меню
        </button>
      </div>
    </>
  )
}
