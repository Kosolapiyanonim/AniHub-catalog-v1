'use client'

import Link from 'next/link'
import { Search, MessageCircle, Music, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CommandPalette } from '@/components/command-palette'
import { useState } from 'react'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Лого - только на десктопе */}
            <Link href="/" className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-white">AniHub</span>
            </Link>

            {/* Поиск */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Поиск аниме..."
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  onClick={() => setIsSearchOpen(true)}
                />
              </div>
            </div>

            {/* Социальные сети - теперь видны и на мобильных */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-400 hover:text-white"
              >
                <Link href="/telegram" target="_blank">
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-400 hover:text-white"
              >
                <Link href="/tiktok" target="_blank">
                  <Music className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-400 hover:text-white"
              >
                <Link href="/instagram" target="_blank">
                  <Instagram className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Десктопная навигация */}
            <nav className="hidden md:flex items-center space-x-6 ml-6">
              <Link href="/catalog" className="text-slate-300 hover:text-white transition-colors">
                Каталог
              </Link>
              <Link href="/favorites" className="text-slate-300 hover:text-white transition-colors">
                Закладки
              </Link>
              <Link href="/notifications" className="text-slate-300 hover:text-white transition-colors">
                Уведомления
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <CommandPalette 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </>
  )
}
