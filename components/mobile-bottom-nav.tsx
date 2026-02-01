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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-around">
          <Link href="/favorites" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition-colors">
            <Bookmark className="w-5 h-5 mb-1" />
            Закладки
          </Link>
          <Link href="/catalog" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition-colors">
            <LayoutGrid className="w-5 h-5 mb-1" />
            Каталог
          </Link>
          <Link href="/" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center -mt-6 border-4 border-background shadow-lg shadow-primary/25">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            AniHub
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition-colors relative">
            <Bell className="w-5 h-5 mb-1" />
            Уведомления
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Link>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary transition-colors h-auto p-0">
                <Menu className="w-5 h-5 mb-1" />
                Меню
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 bg-background border-border">
              <MobileMenuContent onClose={handleCloseMenu} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
