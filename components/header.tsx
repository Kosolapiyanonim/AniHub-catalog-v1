import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/search-dialog"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, List, Settings, Home, Compass, Star, Bell } from 'lucide-react'
import { ApiStatus } from "@/components/api-status"

export async function Header() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from("profiles").select("username, avatar_url").eq("id", user.id).single() : { data: null }

  const signOut = async () => {
    "use server"
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    await supabase.auth.signOut()
    return { success: true }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/placeholder-logo.svg" alt="AniHub Logo" width={24} height={24} />
            <span className="hidden font-bold sm:inline-block">AniHub</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/catalog" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Каталог
            </Link>
            <Link href="/popular" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Популярное
            </Link>
            <Link href="/favorites" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Избранное
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchDialog />
          </div>
          <nav className="flex items-center">
            <ModeToggle />
            <ApiStatus />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} alt={profile?.username || "User"} />
                      <AvatarFallback>{profile?.username ? profile.username[0].toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.username || "Пользователь"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}/lists`}>
                      <List className="mr-2 h-4 w-4" />
                      <span>Мои списки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="flex items-center w-full text-left">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Выйти</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Войти</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
