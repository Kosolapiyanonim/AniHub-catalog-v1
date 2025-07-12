// /components/header.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, User, LogOut, Settings, Heart, Search as SearchIcon } from "lucide-react";
import { SearchDialog } from "./search-dialog";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs";

// --- Основной компонент хедера ---
export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
            AniHub
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/catalog" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Каталог
            </Link>
            <Link href="/popular" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Популярное
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button size="sm" variant="ghost" onClick={() => setSearchOpen(true)}>
              <SearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Поиск</span>
            </Button>
            
            {/* Секция пользователя */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <UserNav user={user} />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login"><Button variant="ghost" size="sm">Войти</Button></Link>
                <Link href="/register"><Button size="sm" className="bg-purple-600 hover:bg-purple-700">Регистрация</Button></Link>
              </div>
            )}

            {/* Мобильное меню */}
            <div className="md:hidden">
              <MobileNav user={user} />
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

// --- Вспомогательные компоненты ---

// Меню для авторизованного пользователя на десктопе
function UserNav({ user }: { user: SupabaseUser }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Вы вышли из аккаунта");
      router.refresh();
    } catch (error) {
      toast.error("Ошибка при выходе");
    }
  };

  const getUserInitials = (user: SupabaseUser) => {
    const name = user.user_metadata?.full_name || user.email;
    return name?.charAt(0).toUpperCase() || "U";
  };

  const getUserName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "Пользователь";
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" className="hidden sm:flex">
        <Bell className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={getUserName(user)} />
              <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{getUserName(user)}</p>
              <p className="text-xs leading-none text-gray-400">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
            <Link href="/profile"><DropdownMenuItem className="cursor-pointer hover:bg-slate-700"><User className="mr-2 h-4 w-4" /><span>Профиль</span></DropdownMenuItem></Link>
            <Link href="/profile/lists"><DropdownMenuItem className="cursor-pointer hover:bg-slate-700"><Heart className="mr-2 h-4 w-4" /><span>Мои списки</span></DropdownMenuItem></Link>
            <Link href="/profile/settings"><DropdownMenuItem className="cursor-pointer hover:bg-slate-700"><Settings className="mr-2 h-4 w-4" /><span>Настройки</span></DropdownMenuItem></Link>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-slate-700 text-red-400 hover:!text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Мобильное меню (шторка справа)
function MobileNav({ user }: { user: SupabaseUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-slate-900 border-slate-800 text-white">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link href="/catalog" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-purple-400 transition-colors">Каталог</Link>
          <Link href="/popular" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-purple-400 transition-colors">Популярное</Link>
          
          <div className="border-t border-slate-800 pt-4">
            {user ? (
                <UserNav user={user} />
            ) : (
                <div className="flex flex-col space-y-2">
                    <Link href="/login"><Button className="w-full justify-start" variant="ghost" onClick={() => setOpen(false)}>Войти</Button></Link>
                    <Link href="/register"><Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setOpen(false)}>Регистрация</Button></Link>
                </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
