// components/header.tsx

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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import {
  Menu, Bell, User, LogOut, Settings, Heart, Search, CheckCheck, BookOpen, MessageSquare, History, Users, Sun, Moon
} from 'lucide-react'
import { CommandPalette } from './command-palette'
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { useSearchStore } from '@/hooks/use-search-store'

// Компонент-заглушка для уведомлений
function NotificationsDropdown() {
  const [hasNotifications, setHasNotifications] = useState(true)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative h-8 w-8'>
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
          <Button variant='ghost' size='sm' className='h-auto p-1 text-xs text-muted-foreground'>
            <CheckCheck className='w-3 h-3 mr-1' />
            Прочитать все
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='p-4 text-center text-sm text-muted-foreground'>
          Пока нет новых уведомлений.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Основной компонент хедера
export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const toggleSearch = useSearchStore((state) => state.toggle)

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

  const MobileNavLinks = ({ onLinkClick }: { onLinkClick: () => void }) => (
    <nav className="flex flex-col gap-4 pt-8 text-lg">
      <Link href='/catalog' className="hover:text-purple-400" onClick={onLinkClick}>Каталог</Link>
      <Link href='/popular' className="hover:text-purple-400" onClick={onLinkClick}>Популярное</Link>
      <DropdownMenuSeparator />
      {user ? (
        <>
          <Link href={`/profile/${user.id}/history`} className="flex items-center gap-2 hover:text-purple-400" onClick={onLinkClick}><History className="w-5 h-5" />История просмотров</Link>
          <Link href={`/profile/${user.id}/friends`} className="flex items-center gap-2 hover:text-purple-400" onClick={onLinkClick}><Users className="w-5 h-5" />Список друзей</Link>
          <Link href={`/profile/${user.id}/favorites`} className="flex items-center gap-2 hover:text-purple-400" onClick={onLinkClick}><Heart className="w-5 h-5" />Избранное</Link>
          <DropdownMenuSeparator />
          <Button variant="ghost" className="justify-start text-lg p-0 h-auto" onClick={handleSignOut}><LogOut className="w-5 h-5 mr-2"/>Выход</Button>
        </>
      ) : (
        <>
           <Link href='/login' passHref onClick={onLinkClick}><Button variant='ghost' className="w-full justify-start text-lg p-0 h-auto">Войти</Button></Link>
           <Link href='/register' passHref onClick={onLinkClick}><Button className="w-full justify-start text-lg">Регистрация</Button></Link>
        </>
      )}
    </nav>
  );

  return (
    <>
      <header className='fixed inset-x-0 top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between gap-4'>
          <Link href='/' className='text-xl font-bold text-white'>
            AniHub
          </Link>

          {/* Навигация для десктопа */}
          <nav className='hidden md:flex items-center space-x-4'>
            <Link href='/catalog' className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>Каталог</Link>
            <Link href='/popular' className='text-sm font-medium text-gray-300 hover:text-white transition-colors'>Популярное</Link>
          </nav>

          <div className='flex flex-1 items-center justify-end gap-2'>
             {/* Поиск теперь тоже часть этого блока, чтобы он был по центру на мобилке */}
             <div className="flex-1 max-w-xs hidden sm:block">
                <Button variant='outline' className='h-9 w-full justify-start text-sm text-muted-foreground' onClick={toggleSearch}>
                  <Search className='h-4 w-4 mr-2' />
                  Поиск...
                  <span className='ml-auto text-xs bg-slate-700 rounded-sm px-1.5 py-0.5'>Ctrl+K</span>
                </Button>
             </div>
             
             <Button variant='ghost' size='icon' className='h-8 w-8 sm:hidden' onClick={toggleSearch}><Search className='h-4 w-4' /></Button>
            
            {loading ? (
              <div className='h-8 w-8 rounded-full bg-slate-800 animate-pulse' />
            ) : user ? (
              <div className='flex items-center gap-2'>
                <NotificationsDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                      <Avatar className='h-8 w-8'><AvatarImage src={user.user_metadata?.avatar_url} /><AvatarFallback>{getUserInitials(user)}</AvatarFallback></Avatar>
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
              <div className='hidden md:flex items-center space-x-1'>
                <Button asChild variant='ghost' size='sm'><Link href='/login'>Войти</Link></Button>
                <Button asChild size='sm'><Link href='/register'>Регистрация</Link></Button>
              </div>
            )}
            
            {/* Бургерное меню для мобильных */}
            <div className='md:hidden'>
              <Sheet>
                <SheetTrigger asChild><Button variant='ghost' size='icon' className='h-8 w-8'><Menu className='h-4 w-4' /></Button></SheetTrigger>
                <SheetContent side='right' className='w-[300px]'>
                  <SheetClose asChild>
                    <MobileNavLinks onLinkClick={() => {}} />
                  </SheetClose>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <CommandPalette />
    </>
  )
}
