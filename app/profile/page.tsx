"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  Star,
  Trophy,
  UserCircle,
} from "lucide-react"

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  role: "admin" | "manager" | "viewer"
  created_at: string
}

const prototypeStats = {
  watching: 7,
  planned: 22,
  completed: 31,
  communityPoints: 420,
  comments: 18,
  streakDays: 6,
}

const roleLabel: Record<Profile["role"], string> = {
  admin: "Администратор",
  manager: "Менеджер",
  viewer: "Зритель",
}

export default function ProfilePrototypePage() {
  const { session, loading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      return
    }

    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
  }, [session?.user?.id])

  const accountAge = useMemo(() => {
    if (!profile?.created_at) return "Новый участник"
    const created = new Date(profile.created_at)
    const diffMs = Date.now() - created.getTime()
    const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    return `${days} дн. в AniHub`
  }, [profile?.created_at])

  const completionRate = Math.round((prototypeStats.completed / (prototypeStats.completed + prototypeStats.watching + prototypeStats.planned)) * 100)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xl">
                  {profile?.username?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile?.username || "Ваш будущий профиль"}</CardTitle>
                <CardDescription className="mt-1">Прототип персональной страницы AniHub с фокусом на комьюнити и персонализацию.</CardDescription>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{profile ? roleLabel[profile.role] : "Гость"}</Badge>
                  <Badge variant="outline">{accountAge}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Профиль 1.0
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {session?.user?.id ? (
                <>
                  <Button asChild variant="outline">
                    <Link href={`/profile/${session.user.id}`}>Редактировать базу</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/catalog">Подобрать аниме</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/login?redirectTo=%2Fprofile">Войти и активировать профиль</Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Списки пользователя</CardDescription>
            <CardTitle className="text-2xl">{prototypeStats.watching + prototypeStats.planned + prototypeStats.completed}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Смотрю</span><span>{prototypeStats.watching}</span></div>
            <div className="flex justify-between"><span>В планах</span><span>{prototypeStats.planned}</span></div>
            <div className="flex justify-between"><span>Просмотрено</span><span>{prototypeStats.completed}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Комьюнити-активность</CardDescription>
            <CardTitle className="text-2xl">{prototypeStats.communityPoints} XP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />Комментарии</span><span>{prototypeStats.comments}</span></div>
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><CalendarCheck className="h-4 w-4" />Серия дней</span><span>{prototypeStats.streakDays}</span></div>
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><Bell className="h-4 w-4" />Подписки</span><span>5</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Прогресс вкуса</CardDescription>
            <CardTitle className="text-2xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-muted-foreground">Доля завершённых тайтлов относительно ваших активных планов.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />Комфортный профиль: что уже есть</CardTitle>
            <CardDescription>Опираемся на текущие возможности AniHub из документации сервиса.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2"><BookOpen className="h-4 w-4 mt-0.5 text-primary" /><p>Личные списки статусов: смотрю, в планах, просмотрено, on-hold и dropped.</p></div>
            <div className="flex items-start gap-2"><Bell className="h-4 w-4 mt-0.5 text-primary" /><p>Подписки на новые эпизоды по тайтлам для удержания пользователя.</p></div>
            <div className="flex items-start gap-2"><MessageSquare className="h-4 w-4 mt-0.5 text-primary" /><p>Комментарии и обсуждения как ядро сообщества.</p></div>
            <div className="flex items-start gap-2"><UserCircle className="h-4 w-4 mt-0.5 text-primary" /><p>Роли (viewer/manager/admin) и база для будущих бейджей и репутации.</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-primary" />Практики лучших комьюнити-сервисов</CardTitle>
            <CardDescription>Это блок прототипа, который поможет сделать профиль «живым».</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>1. Публичная витрина профиля: любимые жанры, текущий тайтл, любимая озвучка.</p>
            <p>2. Еженедельный обзор активности: сколько серий посмотрено, что обсуждали друзья.</p>
            <p>3. Социальный слой: подписки на пользователей, лента комментариев и достижений.</p>
            <p>4. Мягкая геймификация: ранги, бейджи и челленджи без перегруза интерфейса.</p>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm"><Link href="/favorites">Открыть закладки</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/notifications">Уведомления</Link></Button>
              <Button asChild variant="outline" size="sm"><Link href="/catalog">Каталог</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
