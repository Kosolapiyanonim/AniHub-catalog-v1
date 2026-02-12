"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminCard } from "@/components/admin/admin-card"
import { BarChart3, TrendingUp, Users, Film, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  stats: {
    totalUsers: number
    totalAnimes: number
    totalComments: number
    totalAdmins: number
    recentUsers: number
    recentComments: number
  }
  roleCounts: {
    admin: number
    manager: number
    viewer: number
  }
  popularAnimes: Array<{
    id: number
    title: string
    shikimori_rating: number
    shikimori_votes: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics")
        }
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Не удалось загрузить данные</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Аналитика</h1>
        <p className="text-slate-400">Детальная статистика и метрики</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <AdminCard
            title="Пользователи"
            value={data.stats.totalUsers}
            description={`+${data.stats.recentUsers} за 7 дней`}
            icon={<Users className="h-4 w-4" />}
            className="cursor-pointer hover:bg-slate-700 transition-colors"
          />
        </Link>
        <Link href="/admin/anime">
          <AdminCard
            title="Аниме"
            value={data.stats.totalAnimes}
            icon={<Film className="h-4 w-4" />}
            className="cursor-pointer hover:bg-slate-700 transition-colors"
          />
        </Link>
        <Link href="/admin/moderate/comments">
          <AdminCard
            title="Комментарии"
            value={data.stats.totalComments}
            description={`+${data.stats.recentComments} за 7 дней`}
            icon={<MessageSquare className="h-4 w-4" />}
            className="cursor-pointer hover:bg-slate-700 transition-colors"
          />
        </Link>
        <AdminCard
          title="Администраторы"
          value={data.stats.totalAdmins}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Распределение ролей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Администраторы</span>
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  {data.roleCounts.admin}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Менеджеры</span>
                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                  {data.roleCounts.manager}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Зрители</span>
                <Badge variant="outline" className="border-slate-500/50 text-slate-400">
                  {data.roleCounts.viewer}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Топ аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.popularAnimes.slice(0, 5).map((anime, index) => (
                <div
                  key={anime.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">#{index + 1}</span>
                    <span className="text-white text-sm">{anime.title}</span>
                  </div>
                  <Badge variant="outline">
                    {anime.shikimori_rating?.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





