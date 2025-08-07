import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Placeholder for notifications
  const notifications = [
    {
      id: 1,
      message: 'Вышла новая серия аниме "Моя геройская академия"!',
      date: '2023-11-05 10:30',
      read: false,
    },
    {
      id: 2,
      message: 'Ваш список "Смотрю" был обновлен.',
      date: '2023-11-04 18:00',
      read: true,
    },
    {
      id: 3,
      message: 'Новая статья в блоге: "Топ-5 аниме для новичков".',
      date: '2023-11-03 09:00',
      read: false,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Bell className="h-8 w-8" />
        Уведомления
      </h1>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ваши уведомления</CardTitle>
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
            <CheckCheck className="w-3 h-3 mr-1" />
            Прочитать все
          </Button>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`flex items-center gap-4 p-3 rounded-md ${notification.read ? 'bg-muted/50' : 'bg-accent/20'}`}>
                  <Bell className={`h-5 w-5 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div className="flex-1">
                    <p className={`font-medium ${notification.read ? 'text-muted-foreground' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.date}</p>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Пока нет новых уведомлений.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
