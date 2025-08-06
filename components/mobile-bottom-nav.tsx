'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Grid3X3, Bell, Menu, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ArrowRightToLine } from 'lucide-react'
import { MobileMenuContent } from './mobile-menu-content'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/favorites',
      icon: Bookmark,
      label: 'Закладки',
      isActive: pathname.startsWith('/favorites')
    },
    {
      href: '/catalog',
      icon: Grid3X3,
      label: 'Каталог',
      isActive: pathname.startsWith('/catalog')
    },
    {
      href: '/',
      icon: Home,
      label: 'Главная',
      isActive: pathname === '/',
      isCenter: true
    },
    {
      href: '/notifications',
      icon: Bell,
      label: 'Уведомления',
      isActive: pathname.startsWith('/notifications')
    },
  ]

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                item.isCenter && "bg-blue-600 text-white scale-110 -mt-4 rounded-full shadow-lg shadow-blue-600/50",
                !item.isCenter && item.isActive && "text-blue-400",
                !item.isCenter && !item.isActive && "text-slate-400 hover:text-slate-200"
              )}
            >
              <item.icon 
                size={item.isCenter ? 28 : 22} 
                className={cn(item.isCenter && "mb-0.5")}
              />
              <span className={cn(
                "text-xs font-medium",
                item.isCenter && "text-[10px] mt-0.5"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
          {/* Menu Trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px] text-slate-400 hover:text-slate-200">
                <Menu size={22} />
                <span className="text-xs font-medium">Меню</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[300px] bg-slate-900 border-l-slate-700">
              <MobileMenuContent />
              <SheetClose asChild>
                <Button variant="ghost" className="absolute bottom-4 right-4 text-slate-400 hover:text-white">
                  <ArrowRightToLine className="w-5 h-5 mr-2" />
                  Закрыть
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}
