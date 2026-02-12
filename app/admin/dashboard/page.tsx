"use client"

import { useState, useEffect } from "react"
import { AdminCard } from "@/components/admin/admin-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Film, MessageSquare, Shield, TrendingUp, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError(err instanceof Error ? err.message : "Unknown error")
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Ошибка: {error}</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Дашборд</h1>
        <p className="text-slate-400">Обзор статистики и метрик сайта</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          title="Всего пользователей"
          value={data.stats.totalUsers}
          description={`+${data.stats.recentUsers} за последние 7 дней`}
          icon={<Users className="h-4 w-4" />}
        />
        <AdminCard
          title="Всего аниме"
          value={data.stats.totalAnimes}
          icon={<Film className="h-4 w-4" />}
        />
        <AdminCard
          title="Всего комментариев"
          value={data.stats.totalComments}
          description={`+${data.stats.recentComments} за последние 7 дней`}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <AdminCard
          title="Администраторов"
          value={data.stats.totalAdmins}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Role Distribution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Распределение ролей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{data.roleCounts.admin}</div>
              <div className="text-sm text-slate-400">Администраторы</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{data.roleCounts.manager}</div>
              <div className="text-sm text-slate-400">Менеджеры</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">{data.roleCounts.viewer}</div>
              <div className="text-sm text-slate-400">Зрители</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Animes */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Популярные аниме</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.popularAnimes.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Нет данных</p>
            ) : (
              data.popularAnimes.map((anime, index) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-white font-medium">{anime.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400">
                      Рейтинг: <span className="text-white font-semibold">{anime.shikimori_rating?.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Голосов: <span className="text-white">{anime.shikimori_votes || 0}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





