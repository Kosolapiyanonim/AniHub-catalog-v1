'use client'

import { Session } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState } from 'react'

export function TestAuth({ session }: { session: Session | null }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Успешный вход!')
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Проверьте почту для подтверждения!')
      router.refresh()
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Вы вышли из аккаунта.')
      router.refresh()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Тест Аутентификации</CardTitle>
          <CardDescription>
            Проверьте состояние сессии и функции входа/выхода.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSignIn} className="flex-1">Войти</Button>
            <Button onClick={handleSignUp} variant="outline" className="flex-1">Зарегистрироваться</Button>
          </div>
          <Button onClick={handleSignOut} variant="destructive" className="w-full">Выйти</Button>

          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h3 className="font-semibold mb-2">Состояние сессии:</h3>
            {session ? (
              <div className="space-y-1 text-sm">
                <p><strong>Статус:</strong> Авторизован</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>ID пользователя:</strong> {session.user.id}</p>
                <p><strong>Создан:</strong> {new Date(session.user.created_at).toLocaleString()}</p>
                <p><strong>Последний вход:</strong> {new Date(session.user.last_sign_in_at || '').toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Не авторизован</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
