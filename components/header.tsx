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
import { Menu, Bell, User, LogOut, Settings, Heart, Search } from 'lucide-react'
import { CommandPalette } from './command-palette' // <-- [ИЗМЕНЕНИЕ] Импортируем CommandPalette
import { toast } from 'sonner'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false) // <-- [ИЗМЕНЕНИЕ] Состояние для CommandPalette
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Вы вышли из аккаунта')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
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

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-6'>
            <Link href='/catalog' className='text-sm font-medium hover:text-primary transition-colors'>
              Каталог
            </Link>
            {/* // <-- [ИЗМЕНЕНИЕ] Кнопка для открытия CommandPalette */}
            <Button variant='outline' className='h-8' onClick={() => setCommandPaletteOpen(true)}>
              <Search className='h-4 w-4 mr-2' />
              Поиск...
              <span className='ml-4 text-xs bg-slate-700 rounded-sm px-1.5 py-0.5'>Ctrl+K</span>
            </Button>
            <Link href='/popular' className='text-sm font-medium hover:text-primary transition-colors'>
              Популярное
            </Link>
          </nav>

          <div className='flex items-center gap-4'>
            {/* User Section */}
            {loading ? (
              <div className='h-8 w-8 rounded-full bg-muted animate-pulse' />
            ) : user ? (
              <div className='flex items-center space-x-2'>
                {/* Notifications */}
                <Button variant='ghost' size='icon' className='h-8 w-8 hidden sm:flex'>
                  <Bell className='h-4 w-4' />
                </Button>

                {/* User Menu */}
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
                    <DropdownMenuItem>
                      <User className='mr-2 h-4 w-4' />
                      <span>Профиль</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Heart className='mr-2 h-4 w-4' />
                      <span>Мои списки</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className='mr-2 h-4 w-4' />
                      <span>Настройки</span>
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
                <Link href='/login'>
                  <Button variant='ghost' size='sm'>
                    Войти
                  </Button>
                </Link>
                <Link href='/register'>
                  <Button size='sm'>Регистрация</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='sm' className='md:hidden'>
                  <Menu className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
                {/* ...содержимое мобильного меню без изменений... */}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* // <-- [ИЗМЕНЕНИЕ] CommandPalette рендерится здесь */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </>
  )
}
