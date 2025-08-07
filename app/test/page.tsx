import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TestPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Тестовая страница</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Тест API</CardTitle>
            <CardDescription>Проверьте работу различных API-эндпоинтов.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-api" passHref>
              <Button className="w-full">Перейти к тесту API</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест Аутентификации</CardTitle>
            <CardDescription>Проверьте функциональность входа/выхода и сессий.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-auth" passHref>
              <Button className="w-full">Перейти к тесту Аутентификации</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест UI-компонентов</CardTitle>
            <CardDescription>Проверьте отображение и взаимодействие с UI-компонентами.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              (В разработке)
            </Button>
          </CardContent>
        </Card>
      </div>

      {user && (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Вы вошли как: <span className="font-semibold">{user.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Ваш ID пользователя: <span className="font-mono">{user.id}</span>
          </p>
        </div>
      )}
    </main>
  )
}
