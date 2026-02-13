"use client"

import { FormEvent, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Account = {
  id: string
  email: string
  displayName: string
  createdAt: string
  updatedAt: string
}

type ApiResult = {
  account?: Account
  accessToken?: string
  mode?: string
  message?: string
  error?: string
}

export default function StubAccountPage() {
  const [registerEmail, setRegisterEmail] = useState("demo@anihub.local")
  const [registerPassword, setRegisterPassword] = useState("strongpass1")
  const [registerDisplayName, setRegisterDisplayName] = useState("Demo User")

  const [loginEmail, setLoginEmail] = useState("demo@anihub.local")
  const [loginPassword, setLoginPassword] = useState("strongpass1")

  const [profileId, setProfileId] = useState("")

  const [result, setResult] = useState<ApiResult | null>(null)
  const [busy, setBusy] = useState(false)

  const prettyResult = useMemo(() => JSON.stringify(result, null, 2), [result])

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)

    try {
      const response = await fetch("/api/stub-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          displayName: registerDisplayName,
        }),
      })

      const payload = (await response.json()) as ApiResult
      setResult(payload)

      if (payload.account?.id) {
        setProfileId(payload.account.id)
      }
    } catch {
      setResult({ error: "Ошибка сети при регистрации" })
    } finally {
      setBusy(false)
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)

    try {
      const response = await fetch("/api/stub-account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const payload = (await response.json()) as ApiResult
      setResult(payload)

      if (payload.account?.id) {
        setProfileId(payload.account.id)
      }
    } catch {
      setResult({ error: "Ошибка сети при логине" })
    } finally {
      setBusy(false)
    }
  }

  async function handleGetProfile() {
    if (!profileId.trim()) {
      setResult({ error: "Введите ID профиля" })
      return
    }

    setBusy(true)
    try {
      const response = await fetch(`/api/stub-account?id=${encodeURIComponent(profileId)}`)
      const payload = (await response.json()) as ApiResult
      setResult(payload)
    } catch {
      setResult({ error: "Ошибка сети при получении профиля" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Тест заглушки аккаунта</CardTitle>
          <CardDescription>
            Страница для ручной проверки API заглушки: регистрация, логин и получение профиля.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRegister} className="space-y-3">
            <h2 className="font-semibold">1) Регистрация</h2>
            <div className="grid gap-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                type="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-password">Пароль</Label>
              <Input
                id="register-password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                type="password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="register-name">Имя</Label>
              <Input
                id="register-name"
                value={registerDisplayName}
                onChange={(event) => setRegisterDisplayName(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy}>
              Зарегистрировать пользователя
            </Button>
          </form>

          <Separator />

          <form onSubmit={handleLogin} className="space-y-3">
            <h2 className="font-semibold">2) Логин</h2>
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                type="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Пароль</Label>
              <Input
                id="login-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
                required
              />
            </div>
            <Button type="submit" variant="secondary" disabled={busy}>
              Войти
            </Button>
          </form>

          <Separator />

          <section className="space-y-3">
            <h2 className="font-semibold">3) Получить профиль по ID</h2>
            <div className="grid gap-2">
              <Label htmlFor="profile-id">ID профиля</Label>
              <Input
                id="profile-id"
                value={profileId}
                onChange={(event) => setProfileId(event.target.value)}
                placeholder="UUID пользователя"
              />
            </div>
            <Button onClick={handleGetProfile} variant="outline" disabled={busy}>
              Получить профиль
            </Button>
          </section>

          <Separator />

          <section className="space-y-2">
            <h2 className="font-semibold">Результат</h2>
            <pre className="overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{prettyResult ?? "Нет данных"}</pre>
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
