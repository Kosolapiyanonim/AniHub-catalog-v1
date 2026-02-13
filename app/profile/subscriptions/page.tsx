"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BellOff, Loader2 } from "lucide-react"

type SubscriptionItem = {
  created_at: string
  anime: {
    id: number
    shikimori_id: string
    title: string
    poster_url: string | null
    year: number | null
    type: string | null
  }
}

export default function ProfileSubscriptionsPage() {
  const { session, loading } = useSupabase()
  const [items, setItems] = useState<SubscriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setItems([])
      setIsLoading(false)
      return
    }

    fetch("/api/subscriptions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [session?.user?.id])

  if (loading || isLoading) {
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
            <CardTitle>Подписки</CardTitle>
            <CardDescription>Авторизуйтесь, чтобы видеть подписки на аниме.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirectTo=%2Fprofile%2Fsubscriptions">Войти</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Мои подписки</h1>
        <p className="text-sm text-muted-foreground">Все подписки открываются на страницу тайтла (/anime/id), не на watch.</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <BellOff className="h-6 w-6" />
            <p>У вас пока нет подписок.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={`subscription-${item.anime.id}`} href={`/anime/${item.anime.shikimori_id}`} className="block">
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-2">{item.anime.title}</CardTitle>
                  <CardDescription>
                    {item.anime.year ?? "—"} {item.anime.type ? `• ${item.anime.type}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">Перейти в /anime/{item.anime.shikimori_id}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
