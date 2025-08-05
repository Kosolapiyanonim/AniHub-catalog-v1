"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export function TestAuthComponent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешная регистрация",
        description: "Проверьте свою электронную почту для подтверждения.",
      })
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-2xl font-bold">Тестовые операции аутентификации</h2>
      <div className="space-y-2">
        <Label htmlFor="test-email">Email</Label>
        <Input
          id="test-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="test-password">Пароль</Label>
        <Input
          id="test-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSignUp} disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
        <Button onClick={handleSignIn} disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
      </div>
    </div>
  )
}
