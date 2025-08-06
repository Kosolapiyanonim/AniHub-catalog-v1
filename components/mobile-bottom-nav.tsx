'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Grid3X3, Bell, Menu, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/favorites',
      icon: Bookmark,
      label: 'Закладки',
      isActive: pathname === '/favorites'
    },
    {
      href: '/catalog',
      icon: Grid3X3,
      label: 'Каталог',
      isActive: pathname === '/catalog'
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
      isActive: pathname === '/notifications'
    },
    {
      href: '/menu',
      icon: Menu,
      label: 'Меню',
      isActive: pathname === '/menu'
    }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                item.isCenter && "bg-blue-600 text-white scale-110 -mt-2",
                !item.isCenter && item.isActive && "text-blue-400",
                !item.isCenter && !item.isActive && "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon 
                size={item.isCenter ? 24 : 20} 
                className={cn(
                  item.isCenter && "mb-1"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                item.isCenter && "text-[10px]"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
