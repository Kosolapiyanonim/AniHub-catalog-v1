import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Bookmark, Heart, User, Settings, LogOut, Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'

export default async function MenuPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const handleSignOut = async () => {
    'use server'
    const supabase = createServerComponentClient({ cookies })
    await supabase.auth.signOut()
    toast.success("Вы вышли из аккаунта")
    redirect('/')
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Меню</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Навигация</CardTitle>
            <CardDescription>Основные разделы сайта.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <Home className="mr-3 h-5 w-5" />
              Главная
            </Link>
            <Link href="/catalog" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <Bookmark className="mr-3 h-5 w-5" />
              Каталог
            </Link>
            <Link href="/popular" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <Heart className="mr-3 h-5 w-5" />
              Популярное
            </Link>
            <Link href="/blog" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <Bell className="mr-3 h-5 w-5" />
              Блог
            </Link>
          </CardContent>
        </Card>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Аккаунт</CardTitle>
              <CardDescription>Управление вашим профилем.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/profile/${user.id}`} className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
                <User className="mr-3 h-5 w-5" />
                Профиль
              </Link>
              <Link href={`/profile/${user.id}/lists`} className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
                <Heart className="mr-3 h-5 w-5" />
                Мои списки
              </Link>
              <Link href="/settings" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
                <Settings className="mr-3 h-5 w-5" />
                Настройки
              </Link>
              <form action={handleSignOut}>
                <Button type="submit" variant="ghost" className="w-full justify-start py-2 px-3 text-red-400 hover:text-red-300">
                  <LogOut className="mr-3 h-5 w-5" />
                  Выйти
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Вход / Регистрация</CardTitle>
              <CardDescription>Присоединяйтесь к нашему сообществу.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/login" passHref>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-3 h-5 w-5" />
                  Войти
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button className="w-full justify-start">
                  <User className="mr-3 h-5 w-5" />
                  Регистрация
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Социальные сети</CardTitle>
            <CardDescription>Следите за нами.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/telegram" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.364 5.636a9 9 0 1 0 0 12.728 9 9 0 0 0 0-12.728zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 8.908L9.392 7.196c-.58-.228-1.08.02-1.08.684l.003 4.374c0 .38.25.68.6.68h.002l4.56 2.04c.58.228 1.08-.02 1.08-.684l-.003-4.374c0-.38-.25-.68-.6-.68h-.002z"/></svg>
              Telegram
            </Link>
            <Link href="/instagram" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2A2.2 2.2 0 0 0 4 6.2v8.4A2.2 2.2 0 0 0 6.2 19.8h8.4A2.2 2.2 0 0 0 19.8 16.2V7.8A2.2 2.2 0 0 0 17.8 4H7.6zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6.5-3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>
              Instagram
            </Link>
            <Link href="/tiktok" className="flex items-center py-2 px-3 hover:bg-accent rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525 2.118c.882-.04 1.765.03 2.637.232.91.21 1.79.54 2.62.99.83.45 1.59.99 2.27 1.62.68.63 1.27 1.34 1.77 2.12.5.78.89 1.63 1.17 2.53.28.9.45 1.83.5 2.77.05.94-.01 1.88-.18 2.81-.17.93-.43 1.85-.78 2.74-.35.89-.79 1.75-1.32 2.56-.53.81-1.15 1.58-1.85 2.29-.7.71-1.49 1.36-2.36 1.93-.87.57-1.82 1.07-2.84 1.48-1.02.41-2.09.74-3.19.98-1.1.24-2.23.39-3.37.45-1.14.06-2.28.03-3.41-.09-1.13-.12-2.25-.34-3.34-.66-1.09-.32-2.15-.73-3.16-1.23-.5-.25-.98-.52-1.44-.81-.46-.29-.9-.6-1.32-.93-.42-.33-.82-.68-1.19-1.05-.37-.37-.72-.76-1.04-1.17-.32-.41-.61-.84-.87-1.29-.26-.45-.48-.91-.66-1.39-.18-.48-.35-.97-.49-1.47-.14-.5-.25-1-.34-1.5-.09-.5-.15-.99-.18-1.49-.03-.5-.03-.99-.01-1.49.02-.5.07-.99.15-1.48.08-.49.19-.98.33-1.46.14-.48.31-.95.51-1.41.2-.46.43-.9.69-1.33.26-.43.55-.84.87-1.23.32-.39.67-.76 1.04-1.1.37-.34.77-.66 1.19-.96.42-.3.86-.58 1.32-.84.46-.26.93-.5 1.42-.72.49-.22.99-.42 1.5-.59.51-.17 1.02-.32 1.54-.44.52-.12 1.04-.21 1.56-.28.52-.07 1.04-.11 1.56-.13.52-.02 1.04-.01 1.56.03zM12 4.5c-.83 0-1.66.08-2.48.24-.82.16-1.63.4-2.42.72-.79.32-1.55.72-2.28 1.19-.73.47-1.42 1.02-2.07 1.63-.65.61-1.25 1.29-1.8 2.02-.55.73-1.05 1.5-1.49 2.32-.44.82-.82 1.67-1.14 2.55-.32.88-.58 1.78-.78 2.69-.2.91-.35 1.84-.45 2.78-.1.94-.14 1.88-.12 2.82.02.94.12 1.87.3 2.79.18.92.43 1.83.75 2.72.32.89.73 1.75 1.22 2.57.49.82 1.07 1.58 1.73 2.28.66.7 1.4 1.34 2.22 1.91.82.57 1.71 1.07 2.67 1.48 1.02.41 2.09.74 3.19.98 1.1.24 2.23.39 3.37.45 1.14.06 2.28.03 3.41-.09 1.13-.12 2.25-.34 3.34-.66 1.09-.32 2.15-.73 3.16-1.23.5-.25.98-.52 1.44-.81.46-.29.9-.6 1.32-.93.42-.33.82-.68 1.19-1.05.37-.37.72-.76 1.04-1.17.32-.41.61-.84.87-1.29.26-.45.48-.91.66-1.39.18-.48.35-.97.49-1.47.14-.5.25-1 .34-1.5.09-.5.15-.99.18-1.49.03-.5.03-.99.01-1.49-.02-.5-.07-.99-.15-1.48-.08-.49-.19-.98-.33-1.46-.14-.48-.31-.95-.51-1.41-.2-.46-.43-.9-.69-1.33-.26-.43-.55-.84-.87-1.23-.32-.39-.67-.76-1.04-1.1-.37-.34-.77-.66-1.19-.96-.42-.3-.86-.58-1.32-.84-.46-.26-.93-.5-1.42-.72-.49-.22-.99-.42-1.5-.59-.51-.17-1.02-.32-1.54-.44-.52-.12-1.04-.21-1.56-.28-.52-.07-1.04-.11-1.56-.13-.52-.02-1.04-.01-1.56.03z"/></svg>
              TikTok
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
