"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { ApiStatus } from "@/components/api-status"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { SearchDialog } from "@/components/search-dialog"
import { useSearchStore } from "@/hooks/use-search-store"

export function Header() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const { openSearchDialog } = useSearchStore()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешный выход",
        description: "Вы успешно вышли из системы.",
      })
      router.push("/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="#" className="mr-6 flex items-center" prefetch={false}>
                <Image src="/placeholder-logo.svg" width={32} height={32} alt="AniHub Logo" />
                <span className="sr-only">AniHub</span>
              </Link>
              <div className="grid gap-2 py-6">
                <Link href="/" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Главная
                </Link>
                <Link href="/catalog" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Каталог
                </Link>
                <Link href="/popular" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Популярное
                </Link>
                {user && (
                  <Link
                    href="/admin/parser"
                    className="flex w-full items-center py-2 text-lg font-semibold"
                    prefetch={false}
                  >
                    Парсер
                  </Link>
                )}
                <div className="flex items-center py-2">
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="mr-6 flex items-center" prefetch={false}>
            <Image src="/placeholder-logo.svg" width={32} height={32} alt="AniHub Logo" />
            <span className="font-bold text-lg ml-2">AniHub</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary" prefetch={false}>
              Главная
            </Link>
            <Link href="/catalog" className="hover:text-primary" prefetch={false}>
              Каталог
            </Link>
            <Link href="/popular" className="hover:text-primary" prefetch={false}>
              Популярное
            </Link>
            {user && (
              <Link href="/admin/parser" className="hover:text-primary" prefetch={false}>
                Парсер
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={openSearchDialog}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <ModeToggle />
          {user ? (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          )}
          <ApiStatus />
        </div>
      </div>
      <SearchDialog />
    </header>
  )
}
