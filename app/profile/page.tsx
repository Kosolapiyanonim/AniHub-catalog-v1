"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bookmark, Bell, CheckCircle2, Heart, Loader2, Star } from "lucide-react"

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  role: "admin" | "manager" | "viewer"
  created_at: string
}

type ListItem = { status: "watching" | "planned" | "completed" | "dropped" | "on_hold" }
type SubscriptionItem = { anime: { id: number } }
type AnimeRatingItem = { rating: number }
type FavoriteEpisodeItem = { episode_number: number; animes?: { title: string; shikimori_id: string } | null }

export default function ProfilePage() {
  const { session, loading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listItems, setListItems] = useState<ListItem[]>([])
  const [subscriptionItems, setSubscriptionItems] = useState<SubscriptionItem[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [animeRatings, setAnimeRatings] = useState<AnimeRatingItem[]>([])
  const [favoriteEpisodes, setFavoriteEpisodes] = useState<FavoriteEpisodeItem[]>([])

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      setListItems([])
      setSubscriptionItems([])
      setStatsLoading(false)
      setAnimeRatings([])
      setFavoriteEpisodes([])
      return
    }

    setStatsLoading(true)
    Promise.all([
      fetch("/api/profile", { cache: "no-store" }).then((res) => (res.ok ? res.json() : null)),
      fetch("/api/lists", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { items: [] })),
      fetch("/api/subscriptions", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { items: [] })),
      fetch("/api/ratings/anime", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { items: [] })),
      fetch("/api/ratings/episodes?favorites=1", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { items: [] })),
    ])
      .then(([profileData, listsData, subscriptionsData, ratingsData, episodesData]) => {
        setProfile(profileData)
        setListItems(Array.isArray(listsData?.items) ? listsData.items : [])
        setSubscriptionItems(Array.isArray(subscriptionsData?.items) ? subscriptionsData.items : [])
        setAnimeRatings(Array.isArray(ratingsData?.items) ? ratingsData.items : [])
        setFavoriteEpisodes(Array.isArray(episodesData?.items) ? episodesData.items : [])
      })
      .catch(() => {
        setProfile(null)
        setListItems([])
        setSubscriptionItems([])
        setAnimeRatings([])
        setFavoriteEpisodes([])
      })
      .finally(() => setStatsLoading(false))
  }, [session?.user?.id])

  const completedCount = useMemo(
    () => listItems.filter((item) => item.status === "completed").length,
    [listItems]
  )

  const avgRating = useMemo(() => {
    if (!animeRatings.length) return null
    const total = animeRatings.reduce((sum, item) => sum + item.rating, 0)
    return (total / animeRatings.length).toFixed(1)
  }, [animeRatings])

  if (loading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
            <CardDescription>Войдите, чтобы открыть персональный профиль, списки и подписки.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirectTo=%2Fprofile">Войти</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-4">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="h-14 w-14 md:h-16 md:w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.username?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold truncate">{profile?.username || "Пользователь"}</h1>
              <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
              <Badge variant="outline" className="mt-2">Личный профиль</Badge>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button asChild className="h-10">
              <Link href="/profile/lists">Мои списки</Link>
            </Button>
            <Button asChild variant="outline" className="h-10">
              <Link href="/profile/subscriptions">Подписки</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">В списках</span>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{listItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Просмотрено</span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{completedCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Подписки</span>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{subscriptionItems.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Оценено тайтлов</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{animeRatings.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Средняя: {avgRating ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Любимые серии</span>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{favoriteEpisodes.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
