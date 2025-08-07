'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bookmark, Heart, User, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MobileMenuContent } from './mobile-menu-content'
import { useState } from 'react'
import { useSearchStore } from '@/hooks/use-search-store'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const toggleSearch = useSearchStore((state) => state.toggle)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 lg:hidden">
      <div className="container mx-auto h-14 flex items-center justify-around">
        <Link href="/" className="flex flex-col items-center text-xs font-medium text-white hover:text-purple-400 transition-colors">
          <Home className={`h-5 w-5 ${pathname === '/' ? 'text-purple-400' : ''}`} />
          Главная
        </Link>
        <Link href="/catalog" className="flex flex-col items-center text-xs font-medium text-white hover:text-purple-400 transition-colors">
          <Bookmark className={`h-5 w-5 ${pathname === '/catalog' ? 'text-purple-400' : ''}`} />
          Каталог
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center text-xs font-medium text-white hover:text-purple-400 transition-colors h-auto w-auto p-0"
          onClick={toggleSearch}
        >
          <Search className="h-5 w-5" />
          Поиск
        </Button>
        <Link href="/popular" className="flex flex-col items-center text-xs font-medium text-white hover:text-purple-400 transition-colors">
          <Heart className={`h-5 w-5 ${pathname === '/popular' ? 'text-purple-400' : ''}`} />
          Популярное
        </Link>

        {/* Mobile Menu Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center text-xs font-medium text-white hover:text-purple-400 transition-colors h-auto w-auto p-0"
            >
              <Menu className="h-5 w-5" />
              Меню
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-slate-900 border-slate-800">
            <SheetHeader>
              <SheetTitle className="text-left text-white">Меню</SheetTitle>
            </SheetHeader>
            <MobileMenuContent setMobileMenuOpen={setMobileMenuOpen} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
