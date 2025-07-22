"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sheet } from "@/components/ui/sheet"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"
import { HeaderSearch } from "./header-search" // <-- [ИЗМЕНЕНИЕ] Импортируем наш новый компонент

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    // ... (код выхода без изменений)
  }

  const getUserInitials = (user: SupabaseUser) => {
    // ... (код инициалов без изменений)
  }

  const getUserName = (user: SupabaseUser) => {
    // ... (код имени без изменений)
  }

  return (
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
          <HeaderSearch />
          <Link href="/popular" className="text-sm font-medium hover:text-primary transition-colors">
            Популярное
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* User Section */}
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center space-x-2">{/* ... (код меню пользователя без изменений) ... */}</div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* ... (код кнопок входа/регистрации без изменений) ... */}
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            {/* ... (код мобильного меню, можно добавить поиск и сюда) ... */}
          </Sheet>
        </div>
      </div>
    </header>
  )
}
