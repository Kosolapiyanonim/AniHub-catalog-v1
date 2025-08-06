'use client'

import Link from 'next/link'
import { Bookmark, Layers, Bell, Menu, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MobileMenuContent } from './mobile-menu-content'
import { useState } from 'react'

export function MobileBottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 md:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-around">
        <Button variant="ghost" size="icon" asChild className="flex flex-col h-auto w-auto text-xs text-slate-400 hover:text-white">
          <Link href="/favorites">
            <Bookmark className="h-5 w-5 mb-1" />
            Закладки
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="flex flex-col h-auto w-auto text-xs text-slate-400 hover:text-white">
          <Link href="/catalog">
            <Layers className="h-5 w-5 mb-1" />
            Каталог
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="flex flex-col h-auto w-auto text-xs text-slate-400 hover:text-white">
          <Link href="/">
            <Home className="h-5 w-5 mb-1" />
            AniHub
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild className="flex flex-col h-auto w-auto text-xs text-slate-400 hover:text-white">
          <Link href="/notifications">
            <Bell className="h-5 w-5 mb-1" />
            Уведомления
          </Link>
        </Button>
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col h-auto w-auto text-xs text-slate-400 hover:text-white">
              <Menu className="h-5 w-5 mb-1" />
              Меню
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <MobileMenuContent onClose={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </footer>
  )
}
