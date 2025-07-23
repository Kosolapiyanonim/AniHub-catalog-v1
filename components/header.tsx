// components/header.tsx

'use client'

import { useState, useEffect } from 'react'
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Heart,
  Search,
  CheckCheck,
} from 'lucide-react'
import { CommandPalette } from './command-palette'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

// Компонент-заглушка для уведомлений
function NotificationsDropdown() {
  const [hasNotifications, setHasNotifications] = useState(true) // Временно true для демонстрации

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-8 w-8 hidden sm:flex'>
          <Bell className='h-4 w-4' />
          {hasNotifications && (
            <span className='absolute top-1 right-1 flex h-2.5 w-2.5'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500'></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align='end'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Уведомления</span>
          <Button variant='ghost' size='sm' className='h-auto p-1 text-xs'>
            <CheckCheck className='w-3 h-3 mr-1' />
            Прочитать все
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Здесь будет логика отображения вкладок и списка уведомлений */}
        <div className='p-4 text-center text-sm text-muted-foreground'>
          Пока нет новых уведомлений.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Основной компонент хедера
export function Header() {
  const [user, setUser] = = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Логика для Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(open => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Получение данных о пользователе
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

  const getUserInitials = (user: SupabaseUser) => {
    const name = user.user_metadata?.full_name || user.email
    return name?.charAt(0).toUpperCase() || 'U'
  }

  const getUserName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь'
  }

  return (
    <>
      <header className='fixed inset-x-0 top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <Link href='/' className='text-xl font-bold'>
            AniHub
          </Link>

          {/* Навигация для десктопа */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link href='/catalog' className='text-sm font-medium hover:text-purple-400 transition-colors'>
              Каталог
            </Link>
            <Button variant='outline' className='h-8 text-sm text-muted-foreground' onClick={() => setCommandPaletteOpen(true)}>
              <Search className='h-4 w-4 mr-2' />
              Поиск...
              <span className='ml-4 text-xs bg-slate-700 rounded-sm px-1.5 py-0.5'>Ctrl+K</span>
            </Button>
            <Link href='/popular' className='text-sm font-medium hover:text-purple-400 transition-colors'>
              Популярное
            </Link>
          </nav>

          <div className='flex items-center gap-2'>
            {/* Секция пользователя */}
            {loading ? (
              <div className='h-8 w-8 rounded-full bg-slate-800 animate-pulse' />
            ) : user ? (
              <div className='flex items-center space-x-2'>
                <NotificationsDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium leading-none'>{getUserName(user)}</p>
                        <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`}>
                        <User className='mr-2 h-4 w-4' />
                        <span>Профиль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}/lists`}>
                        <Heart className='mr-2 h-4 w-4' />
                        <span>Мои списки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/settings">
                          <Settings className='mr-2 h-4 w-4' />
                          <span>Настройки</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className='mr-2 h-4 w-4' />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className='hidden md:flex items-center space-x-2'>
                <Link href='/login' passHref>
                  <Button variant='ghost' size='sm'>Войти</Button>
                </Link>
                <Link href='/register' passHref>
                  <Button size='sm'>Регистрация</Button>
                </Link>
              </div>
            )}

            {/* Бургерное меню для мобильных */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='md:hidden h-8 w-8'>
                  <Menu className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
                 <nav className="flex flex-col space-y-4 pt-8">
                  <Link href='/catalog' onClick={() => setMobileMenuOpen(false)}>Каталог</Link>
                  <Link href='/popular' onClick={() => setMobileMenuOpen(false)}>Популярное</Link>
                  {/* ... добавить остальные ссылки из вашего ТЗ для мобильного меню ... */}
                 </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
