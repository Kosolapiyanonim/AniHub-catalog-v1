'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Heart, Search, MessageCircle, Music, Instagram } from 'lucide-react'
import { CommandPalette } from './command-palette'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { useSearchStore } from '@/hooks/use-search-store'
import { Input } from '@/components/ui/input' // Добавлен импорт Input

// Компонент-заглушка для уведомлений (если нужен в хедере, но по заданию он внизу)
// function NotificationsDropdown() { ... }

// Основной компонент хедера
export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const toggleSearch = useSearchStore((state) => state.toggle)
  const [isSearchOpen, setIsSearchOpen] = useState(false) // Для CommandPalette

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleSearch])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Вы вышли из аккаунта')
    router.refresh()
  }

  const getUserInitials = (user: SupabaseUser) => (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()
  const getUserName = (user: SupabaseUser) => user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь'

  return (
    <>
      <header className='fixed inset-x-0 top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between gap-4'>
          {/* Лого - только на десктопе */}
          <Link href='/' className='hidden md:flex text-xl font-bold text-white'>
            AniHub
          </Link>

          {/* Поиск (для мобильных и десктопа) */}
          <div className="flex-1 max-w-xs md:max-w-md mx-0 md:mx-4">
            <Button variant='outline' className='h-9 w-full justify-start text-sm text-muted-foreground' onClick={toggleSearch}>
              <Search className='h-4 w-4 mr-2' />
              Поиск...
              <span className='ml-auto text-xs bg-slate-700 rounded-sm px-1.5 py-0.5 hidden md:block'>Ctrl+K</span>
            </Button>
          </div>

          {/* Социальные сети - видны на мобильных и десктопе */}
          <div className="flex items-center space-x-2 md:hidden"> {/* Только для мобильных */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-400 hover:text-white"
            >
              <Link href="/telegram" target="_blank">
                <img src="/icons/telegram.png" alt="Telegram" className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-400 hover:text-white"
            >
              <Link href="/tiktok" target="_blank">
                <img src="/icons/tiktok.png" alt="TikTok" className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-400 hover:text-white"
            >
              <Link href="/instagram" target="_blank">
                <img src="/icons/instagram.png" alt="Instagram" className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Десктопная навигация и авторизация */}
          <div className='hidden md:flex items-center justify-end gap-2'>
            <nav className='flex items-center space-x-4'>
              <Link href='/catalog' className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>Каталог</Link>
              <Link href='/favorites' className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>Закладки</Link>
              <Link href='/notifications' className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>Уведомления</Link>
            </nav>

            {loading ? (
              <div className='h-8 w-8 rounded-full bg-slate-800 animate-pulse' />
            ) : user ? (
              <div className='flex items-center gap-2'>
                {/* <NotificationsDropdown /> Если уведомления нужны в хедере */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                      <Avatar className='h-8 w-8'><AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} /><AvatarFallback>{getUserInitials(user)}</AvatarFallback></Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                      <div className='flex flex-col space-y-1'><p className='text-sm font-medium'>{getUserName(user)}</p><p className='text-xs text-muted-foreground'>{user.email}</p></div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href={`/profile/${user.id}`}><User className='mr-2 h-4 w-4' /><span>Профиль</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href={`/profile/${user.id}/lists`}><Heart className='mr-2 h-4 w-4' /><span>Мои списки</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings"><Settings className='mr-2 h-4 w-4' /><span>Настройки</span></Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}><LogOut className='mr-2 h-4 w-4' /><span>Выйти</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className='flex items-center space-x-1'>
                <Button asChild variant='ghost' size='sm'><Link href='/login'>Войти</Link></Button>
                <Button asChild size='sm'><Link href='/register'>Регистрация</Link></Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <CommandPalette
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </>
  )
}
