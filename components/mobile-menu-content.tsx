"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Home, Compass, Star, Bell, List, Settings, User, LogOut, Info, Newspaper, BookOpen, MessageSquare, Mail, Shield, HelpCircle, Github, Twitter, Youtube, Send } from 'lucide-react'
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { type Profile } from "@/lib/types"

interface MobileMenuContentProps {
  setMobileMenuOpen: (open: boolean) => void
}

export function MobileMenuContent({ setMobileMenuOpen }: MobileMenuContentProps) {
  const { supabase, session } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", session.user.id)
          .single()
        if (error) {
          console.error("Error fetching profile:", error.message)
        } else {
          setProfile(data)
        }
      } else {
        setProfile(null)
      }
    }
    fetchProfile()
  }, [session, supabase])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешно",
        description: "Вы вышли из аккаунта.",
      })
      router.refresh()
      setMobileMenuOpen(false)
    }
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
          <Image src="/placeholder-logo.svg" alt="AniHub Logo" width={32} height={32} />
          <span className="text-xl font-bold">AniHub</span>
        </Link>
      </div>

      <ScrollArea className="flex-grow py-4">
        <div className="px-4 space-y-2">
          {session?.user ? (
            <>
              <Link href={`/profile/${session.user.id}`} onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  <span>Профиль ({profile?.username || session.user.email})</span>
                </Button>
              </Link>
              <Link href={`/profile/${session.user.id}/lists`} onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <List className="mr-2 h-4 w-4" />
                  <span>Мои списки</span>
                </Button>
              </Link>
              <Link href={`/profile/${session.user.id}/settings`} onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </Button>
              </Link>
              <Separator className="my-2" />
            </>
          ) : (
            <Link href="/login" onClick={handleLinkClick}>
              <Button className="w-full">Войти</Button>
            </Link>
          )}

          <Link href="/" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              <span>Главная</span>
            </Button>
          </Link>
          <Link href="/catalog" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Compass className="mr-2 h-4 w-4" />
              <span>Каталог</span>
            </Button>
          </Link>
          <Link href="/popular" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              <span>Популярное</span>
            </Button>
          </Link>
          <Link href="/notifications" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              <span>Уведомления</span>
            </Button>
          </Link>

          <Separator className="my-2" />

          <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">Информация</h3>
          <Link href="/news" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Newspaper className="mr-2 h-4 w-4" />
              <span>Новости</span>
            </Button>
          </Link>
          <Link href="/blog" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Блог</span>
            </Button>
          </Link>
          <Link href="/about" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Info className="mr-2 h-4 w-4" />
              <span>О нас</span>
            </Button>
          </Link>
          <Link href="/contact" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              <span>Контакты</span>
            </Button>
          </Link>
          <Link href="/privacy" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              <span>Политика приватности</span>
            </Button>
          </Link>
          <Link href="/faq" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>FAQ</span>
            </Button>
          </Link>

          <Separator className="my-2" />

          <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">Мы в соцсетях</h3>
          <div className="flex flex-wrap gap-2 px-4">
            <Link href="/telegram" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tiktok" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Image src="/icons/tiktok.png" alt="TikTok" width={20} height={20} />
              </Button>
            </Link>
            <Link href="/instagram" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Image src="/icons/instagram.png" alt="Instagram" width={20} height={20} />
              </Button>
            </Link>
            <Link href="https://github.com/Kosolapiyanonim/AniHub-catalog-v1" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Youtube className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {session?.user && (
            <>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
