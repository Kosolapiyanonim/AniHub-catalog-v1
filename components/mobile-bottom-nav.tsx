'use client'

import Link from 'next/link'
import { Bookmark, LayoutGrid, Bell, Menu, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MobileMenuContent } from './mobile-menu-content'
import { useState } from 'react'

export function MobileBottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 md:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-around">
          <Link href="/favorites" className="flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors">
            <Bookmark className="w-5 h-5 mb-1" />
            Закладки
          </Link>
          <Link href="/catalog" className="flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors">
            <LayoutGrid className="w-5 h-5 mb-1" />
            Каталог
          </Link>
          <Link href="/" className="flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center -mt-6 border-4 border-slate-900 shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            AniHub {/* Изменено на AniHub */}
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5 mb-1" />
            Уведомления
            {/* Пример индикатора уведомлений */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
          </Link>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center text-xs text-slate-400 hover:text-white transition-colors h-auto p-0">
                <Menu className="w-5 h-5 mb-1" />
                Меню
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <MobileMenuContent onClose={handleCloseMenu} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
