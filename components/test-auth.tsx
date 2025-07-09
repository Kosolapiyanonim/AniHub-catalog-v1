"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { CheckCircle, XCircle, UserIcon, Mail, Calendar, Shield } from "lucide-react"

export function TestAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<{
    connection: boolean
    userFetch: boolean
    authState: boolean
  }>({
    connection: false,
    userFetch: false,
    authState: false,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const runTests = async () => {
      setLoading(true)
      const results = { connection: false, userFetch: false, authState: false }

      try {
        // Тест 1: Проверка подключения к Supabase
        const { data, error } = await supabase.auth.getSession()
        results.connection = !error
        results.userFetch = true

        // Тест 2: Получение пользователя
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
        results.authState = !!user

        setTestResults(results)
      } catch (error) {
        console.error("Auth test error:", error)
      } finally {
        setLoading(false)
      }
    }

    runTests()

    // Подписка на изменения аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setTestResults((prev) => ({ ...prev, authState: !!session?.user }))
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const TestResult = ({ test, label }: { test: boolean; label: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
      <span className="text-gray-300">{label}</span>
      {test ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Тест системы аутентификации
          </CardTitle>
          <CardDescription className="text-gray-400">Проверка работоспособности Supabase Auth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Выполнение тестов...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <TestResult test={testResults.connection} label="Подключение к Supabase" />
                <TestResult test={testResults.userFetch} label="Получение данных пользователя" />
                <TestResult test={testResults.authState} label="Состояние аутентификации" />
              </div>

              <div className="pt-4 border-t border-slate-600">
                <h3 className="text-white font-medium mb-3">Статус пользователя:</h3>
                {user ? (
                  <div className="space-y-3">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Авторизован</Badge>

                    <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">ID:</span>
                        <span className="text-white font-mono text-sm">{user.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white">{user.email}</span>
                      </div>

                      {user.user_metadata?.full_name && (
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">Имя:</span>
                          <span className="text-white">{user.user_metadata.full_name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Создан:</span>
                        <span className="text-white">{new Date(user.created_at).toLocaleDateString("ru-RU")}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Подтвержден:</span>
                        <Badge
                          className={
                            user.email_confirmed_at
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {user.email_confirmed_at ? "Да" : "Нет"}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                    >
                      Выйти из аккаунта
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-4">Не авторизован</Badge>
                    <p className="text-gray-400 mb-4">Для тестирования войдите в аккаунт или зарегистрируйтесь</p>
                    <div className="flex gap-3 justify-center">
                      <Button asChild className="bg-purple-600 hover:bg-purple-700">
                        <a href="/login">Войти</a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      >
                        <a href="/register">Регистрация</a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Инструкции по тестированию */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Как протестировать регистрацию</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Тест email регистрации:</p>
                <p className="text-sm text-gray-400">
                  Перейдите на страницу регистрации, заполните форму и проверьте email для подтверждения
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Тест OAuth входа:</p>
                <p className="text-sm text-gray-400">
                  Попробуйте войти через Google или Spotify (требует настройки в Supabase Dashboard)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Проверка состояния:</p>
                <p className="text-sm text-gray-400">
                  После входа обновите эту страницу и проверьте, что все тесты прошли успешно
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
