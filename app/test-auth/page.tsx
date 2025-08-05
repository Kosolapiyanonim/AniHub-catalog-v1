"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { TestAuthComponent } from "@/components/test-auth"

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === "SIGNED_IN") {
        toast({
          title: "Вход выполнен",
          description: `Добро пожаловать, ${session?.user?.email}!`,
        })
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Выход выполнен",
          description: "Вы успешно вышли из системы.",
        })
      }
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [supabase, toast])

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешный выход",
        description: "Вы успешно вышли из системы.",
      })
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">Загрузка...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Тестирование Аутентификации</h1>

      <div className="mb-6">
        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-lg">
              Вы вошли как: <span className="font-semibold">{user.email}</span>
            </p>
            <Button onClick={handleLogout} disabled={loading}>
              Выйти
            </Button>
          </div>
        ) : (
          <p className="text-lg">Вы не вошли в систему.</p>
        )}
      </div>

      <TestAuthComponent />
    </div>
  )
}
