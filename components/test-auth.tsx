"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User, Mail, Calendar, Shield } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"

export function TestAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        if (error) {
          console.error("Supabase connection error:", error)
          setConnectionStatus("error")
        } else {
          setConnectionStatus("connected")
        }
      } catch (error) {
        console.error("Connection test failed:", error)
        setConnectionStatus("error")
      }
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkConnection()
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const testSignOut = async () => {
    try {
      await supabase.auth.signOut()
      console.log("Sign out successful")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Тестирование системы аутентификации</h1>
        <p className="text-muted-foreground">Проверка подключения к Supabase и состояния пользователя</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionStatus === "connected" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : connectionStatus === "error" ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            Статус подключения к Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant={
              connectionStatus === "connected" ? "default" : connectionStatus === "error" ? "destructive" : "secondary"
            }
          >
            {connectionStatus === "connected"
              ? "Подключено"
              : connectionStatus === "error"
                ? "Ошибка подключения"
                : "Проверка..."}
          </Badge>
        </CardContent>
      </Card>

      {/* User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Статус пользователя
          </CardTitle>
          <CardDescription>Информация о текущем пользователе в системе</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Загрузка...</span>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Авторизован</Badge>
                <Button variant="outline" size="sm" onClick={testSignOut}>
                  Выйти (тест)
                </Button>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>

                {user.user_metadata?.full_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Имя:</span>
                    <span>{user.user_metadata.full_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Создан:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">ID:</span>
                  <span className="font-mono text-sm">{user.id}</span>
                </div>

                {user.app_metadata?.provider && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Провайдер:</span>
                    <Badge variant="outline">{user.app_metadata.provider}</Badge>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="secondary">Не авторизован</Badge>
              <div className="flex gap-2">
                <Button asChild>
                  <a href="/login">Войти</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register">Регистрация</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Инструкции по тестированию</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Тест регистрации:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                Перейдите на{" "}
                <a href="/register" className="text-primary hover:underline">
                  /register
                </a>
              </li>
              <li>Заполните форму регистрации</li>
              <li>Проверьте email для подтверждения</li>
              <li>Вернитесь сюда для проверки статуса</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Тест входа:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                Перейдите на{" "}
                <a href="/login" className="text-primary hover:underline">
                  /login
                </a>
              </li>
              <li>Войдите с созданными данными</li>
              <li>Проверьте изменения в шапке сайта</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Тест OAuth (требует настройки):</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>В Supabase Dashboard включите Google/Spotify провайдеры</li>
              <li>Попробуйте войти через социальные сети</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
