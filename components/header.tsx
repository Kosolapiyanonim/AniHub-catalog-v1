"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  // ... другие импорты DropdownMenu
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bell, User, LogOut, Settings, Heart } from "lucide-react"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"
import { SearchDialog } from "./search-dialog" // <-- [ИЗМЕНЕНИЕ] Импортируем наш новый компонент

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false) // <-- Это состояние теперь управляет нашим диалогом
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // ... (весь ваш код useEffect, handleSignOut, и т.д. остается БЕЗ ИЗМЕНЕНИЙ) ...

  return (
    <> {/* Оборачиваем в фрагмент, чтобы добавить SearchDialog */}
      <header className="fixed inset-x-0 top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            AniHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/catalog" className="text-sm font-medium hover:text-primary transition-colors">
              Каталог
            </Link>
            <Link href="/popular" className="text-sm font-medium hover:text-primary transition-colors">
              Популярное
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* [ИЗМЕНЕНИЕ] Эта кнопка теперь просто открывает модальное окно */}
            <Button size="sm" variant="ghost" onClick={() => setSearchOpen(true)}>
              Поиск
            </Button>

            {/* ... (весь ваш код для секции пользователя и мобильного меню остается БЕЗ ИЗМЕНЕНИЙ) ... */}
          </div>
        </div>
      </header>
      {/* [ИЗМЕНЕНИЕ] Добавляем сам компонент диалога сюда */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
