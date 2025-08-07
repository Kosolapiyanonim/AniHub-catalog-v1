import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserProfileCard } from '@/components/user-profile-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== params.id) {
    // Если пользователь не авторизован или пытается получить доступ к чужому профилю, перенаправляем на страницу входа
    redirect('/login')
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Профиль пользователя</h1>
      <UserProfileCard user={user} />

      <Separator className="my-8" />

      <Tabs defaultValue="overview" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="lists">Мои списки</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Обзор активности</CardTitle>
              <CardDescription>Краткая сводка вашей активности на платформе.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Здесь будет отображаться ваша недавняя активность, например, недавно просмотренные аниме или избранные.</p>
              {/* Добавьте реальный контент для обзора */}
              <div className="h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Контент обзора
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lists" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Мои списки аниме</CardTitle>
              <CardDescription>Управляйте своими списками аниме.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Здесь будут отображаться ваши списки: "Смотрю", "Запланировано", "Просмотрено" и т.д.</p>
              {/* Добавьте ссылку на отдельную страницу списков */}
              <a href={`/profile/${user.id}/lists`} className="text-primary hover:underline">
                Перейти к моим спискам
              </a>
              <div className="h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Контент списков
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки профиля</CardTitle>
              <CardDescription>Управляйте настройками вашего аккаунта.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Здесь вы сможете изменить пароль, настроить уведомления и параметры приватности.</p>
              {/* Добавьте ссылку на отдельную страницу настроек */}
              <a href="/settings" className="text-primary hover:underline">
                Перейти к настройкам
              </a>
              <div className="h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Контент настроек
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
