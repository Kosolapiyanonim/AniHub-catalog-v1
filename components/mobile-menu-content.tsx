'use client'

import Link from 'next/link'
import { Home, Bookmark, Heart, User, LogOut, Settings, CheckCheck, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

interface MobileMenuContentProps {
  setMobileMenuOpen: (open: boolean) => void
}

function NotificationsDropdownMobile() {
  const [hasNotifications, setHasNotifications] = useState(true)

  return (
    <div className="flex items-center justify-between py-3 px-2 text-white">
      <span>Уведомления</span>
      <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
        <CheckCheck className="w-3 h-3 mr-1" />
        Прочитать все
      </Button>
      {hasNotifications && (
        <span className="relative flex h-2.5 w-2.5 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
    </div>
  )
}

export function MobileMenuContent({ setMobileMenuOpen }: MobileMenuContentProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

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
    setMobileMenuOpen(false)
  }

  const getUserName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "Пользователь"
  }

  return (
    <div className="flex flex-col space-y-4 mt-8">
      {/* Navigation Links */}
      <Link
        href="/"
        className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Home className="mr-3 h-5 w-5" />
        Главная
      </Link>

      <Link
        href="/catalog"
        className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Bookmark className="mr-3 h-5 w-5" />
        Каталог
      </Link>

      <Link
        href="/popular"
        className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Heart className="mr-3 h-5 w-5" />
        Популярное
      </Link>

      {/* User Section */}
      {loading ? (
        <div className="h-12 w-full rounded-md bg-slate-800 animate-pulse mt-4" />
      ) : user ? (
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <div className="px-2 py-2">
            <p className="text-sm font-medium text-white truncate">{getUserName(user)}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>

          <Link
            href={`/profile/${user.id}`}
            className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="mr-3 h-5 w-5" />
            Профиль
          </Link>

          <Link
            href={`/profile/${user.id}/lists`}
            className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Heart className="mr-3 h-5 w-5" />
            Мои списки
          </Link>

          <Link
            href="/settings"
            className="flex items-center py-3 px-2 text-white hover:text-purple-400 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
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

          <div className="pt-2">
            <NotificationsDropdownMobile />
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full justify-start h-12 border-slate-700">
              <User className="mr-3 h-5 w-5" />
              Войти
            </Button>
          </Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full justify-start h-12">
              <User className="mr-3 h-5 w-5" />
              Регистрация
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
