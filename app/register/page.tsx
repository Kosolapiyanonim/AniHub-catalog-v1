"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Chrome, Music } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Проверьте email для подтверждения регистрации!")
        router.push("/login")
      }
    } catch (error) {
      toast.error("Произошла ошибка при регистрации")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error("Ошибка входа через Google")
    }
  }

  const handleSpotifyLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error("Ошибка входа через Spotify")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md mx-auto bg-slate-800 text-white border-slate-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
          <CardDescription className="text-slate-400">Введите свои данные для регистрации</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Полное имя</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Ваше имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Или войдите через</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleGoogleLogin}>
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" onClick={handleSpotifyLogin}>
              <Music className="mr-2 h-4 w-4" />
              Spotify
            </Button>
          </div>
          <p className="text-center text-sm text-slate-400">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
