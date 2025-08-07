import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Profile } from "@/lib/types"
import { Clock, Eye, Star } from 'lucide-react'

interface UserOverviewContentProps {
  profile: Profile
}

export function UserOverviewContent({ profile }: UserOverviewContentProps) {
  // Placeholder for actual statistics
  const stats = {
    animeWatched: 123,
    episodesWatched: 2500,
    avgRating: 8.5,
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Статистика просмотра</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 text-slate-300">
            <Eye className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-lg font-semibold">{stats.animeWatched}</p>
              <p className="text-sm text-slate-400">Просмотрено аниме</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-lg font-semibold">{stats.episodesWatched}</p>
              <p className="text-sm text-slate-400">Просмотрено эпизодов</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Star className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-lg font-semibold">{stats.avgRating}</p>
              <p className="text-sm text-slate-400">Средний рейтинг</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Недавняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Здесь будет отображаться лента недавней активности пользователя (например, добавления в списки, комментарии).</p>
          {/* Placeholder for activity feed */}
          <ul className="mt-4 space-y-2">
            <li className="text-slate-300">
              <span className="font-medium">Пользователь</span> добавил <span className="font-medium">Название Аниме 1</span> в список "Смотрю". <span className="text-xs text-slate-500">2 часа назад</span>
            </li>
            <li className="text-slate-300">
              <span className="font-medium">Пользователь</span> оценил <span className="font-medium">Название Аниме 2</span> на 9/10. <span className="text-xs text-slate-500">Вчера</span>
            </li>
            <li className="text-slate-300">
              <span className="font-medium">Пользователь</span> завершил просмотр <span className="font-medium">Название Аниме 3</span>. <span className="text-xs text-slate-500">3 дня назад</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
