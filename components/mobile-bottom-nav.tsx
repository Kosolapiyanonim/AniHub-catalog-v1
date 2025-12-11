'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, LayoutGrid, Bell, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MobileMenuContent } from './mobile-menu-content'
import { useState } from 'react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        <Button
          variant="ghost"
          size="icon"
          className={`flex flex-col h-auto w-auto p-2 text-xs gap-1 ${isActive('/favorites') ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
          asChild
        >
          <Link href="/favorites">
            <Bookmark className="h-5 w-5" />
            Закладки
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`flex flex-col h-auto w-auto p-2 text-xs gap-1 ${isActive('/catalog') ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
          asChild
        >
          <Link href="/catalog">
            <LayoutGrid className="h-5 w-5" />
            Каталог
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`flex flex-col h-auto w-auto p-2 text-xs gap-1 ${isActive('/') ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
          asChild
        >
          <Link href="/">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            AniHub
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`flex flex-col h-auto w-auto p-2 text-xs gap-1 ${isActive('/notifications') ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
          asChild
        >
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            Уведомления
          </Link>
        </Button>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col h-auto w-auto p-2 text-xs gap-1 ${isMenuOpen ? 'text-blue-500' : 'text-slate-400 hover:text-white'}`}
            >
              <Menu className="h-5 w-5" />
              Меню
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <MobileMenuContent onClose={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
