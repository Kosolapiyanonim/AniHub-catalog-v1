'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Sun, Moon, Users, Globe, Newspaper, BookOpen, ChevronDown, MessageCircle, Music, Instagram } from 'lucide-react'

export function MobileMenuContent() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col h-full p-4 bg-slate-900 text-white">
      <div className="flex-1 space-y-4">
        {/* Theme Switcher */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800">
          <span className="font-medium">Тема</span>
          <div className="flex items-center gap-2">
            <Button
              variant={theme === 'light' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-5 w-5" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <nav className="flex flex-col space-y-2">
          <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto">
            <Users className="w-6 h-6" />
            Смотреть Вместе
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto" asChild>
            <Link href="/blog">
              <BookOpen className="w-6 h-6" />
              Наш Блог
            </Link>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto" asChild>
            <Link href="/news">
              <Newspaper className="w-6 h-6" />
              Новости
            </Link>
          </Button>
        </nav>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-lg p-3 h-auto">
              <span className="flex items-center gap-3">
                <Globe className="w-6 h-6" />
                Наши ресурсы
              </span>
              <ChevronDown className="w-5 h-5 transition-transform [&[data-state=open]]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-8">
            <Button variant="ghost" className="w-full justify-start gap-3" asChild>
              <Link href="/telegram" target="_blank">
                <MessageCircle className="w-5 h-5" />
                Telegram
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" asChild>
              <Link href="/tiktok" target="_blank">
                <Music className="w-5 h-5" />
                TikTok
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" asChild>
              <Link href="/instagram" target="_blank">
                <Instagram className="w-5 h-5" />
                Instagram
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" asChild>
              <Link href="/en">
                <Globe className="w-5 h-5" />
                English Version
              </Link>
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="mt-auto space-y-3">
        <Separator className="bg-slate-700" />
        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" asChild>
          <Link href="/login">Вход / Регистрация</Link>
        </Button>
      </div>
    </div>
  )
}
