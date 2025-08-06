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
import { SheetClose } from '@/components/ui/sheet' // Import SheetClose

interface MobileMenuContentProps {
  onClose: () => void;
}

export function MobileMenuContent({ onClose }: MobileMenuContentProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col h-full p-4 bg-slate-900 text-white">
      {/* Вход / Регистрация - перемещено наверх */}
      <div className="mb-4">
        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg" asChild>
          <SheetClose asChild>
            <Link href="/login">Вход / Регистрация</Link>
          </SheetClose>
        </Button>
      </div>

      <div className="flex-1 space-y-4">
        {/* Theme Switcher - улучшенный дизайн */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700">
          <span className="font-medium text-slate-300">Тема</span>
          <div className="flex items-center gap-1 bg-slate-700 rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-md ${theme === 'light' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-600/50'}`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-2" /> Светлая
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-md ${theme === 'dark' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-600/50'}`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-2" /> Темная
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        <nav className="flex flex-col space-y-2">
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto" onClick={onClose}>
              <Users className="w-6 h-6" />
              Смотреть Вместе
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto" asChild>
              <Link href="/blog">
                <BookOpen className="w-6 h-6" />
                Наш Блог
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="ghost" className="justify-start gap-3 text-lg p-3 h-auto" asChild>
              <Link href="/news">
                <Newspaper className="w-6 h-6" />
                Новости
              </Link>
            </Button>
          </SheetClose>
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
            <SheetClose asChild>
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/telegram" target="_blank">
                  <MessageCircle className="w-5 h-5" />
                  Telegram
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/tiktok" target="_blank">
                  <Music className="w-5 h-5" />
                  TikTok
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/instagram" target="_blank">
                  <Instagram className="w-5 h-5" />
                  Instagram
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/en">
                  <Globe className="w-5 h-5" />
                  English Version
                </Link>
              </Button>
            </SheetClose>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Кнопка закрытия меню */}
      <SheetClose asChild>
        <Button variant="ghost" className="mt-auto w-full justify-start text-slate-400 hover:text-white">
          <ArrowRightToLine className="w-5 h-5 mr-2" />
          Закрыть меню
        </Button>
      </SheetClose>
    </div>
  )
}
