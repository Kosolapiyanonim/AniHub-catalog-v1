import { Profile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserOverviewContentProps {
  profile: Profile;
}

export function UserOverviewContent({ profile }: UserOverviewContentProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Статистика просмотра</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Просмотрено аниме: <span className="font-semibold">0</span></p>
          <p>Эпизодов просмотрено: <span className="font-semibold">0</span></p>
          <p>Средний рейтинг: <span className="font-semibold">N/A</span></p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Недавняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Пока нет недавней активности.</p>
          {/* Placeholder for activity feed */}
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">О пользователе</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Дата регистрации: <span className="font-semibold">{new Date(profile.created_at).toLocaleDateString()}</span></p>
          {profile.bio && <p>Био: <span className="font-semibold">{profile.bio}</span></p>}
          {profile.website && <p>Веб-сайт: <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{profile.website}</a></p>}
        </CardContent>
      </Card>
    </div>
  );
}
