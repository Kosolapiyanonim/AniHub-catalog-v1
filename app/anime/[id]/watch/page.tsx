import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { PlayerClient } from "@/components/player-client"; // Наш новый интерактивный компонент

export default async function WatchPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 1. Находим ID нашего аниме в основной таблице по shikimori_id
  const { data: animeData } = await supabase
    .from('animes')
    .select('id, title')
    .eq('shikimori_id', params.id)
    .single();

  if (!animeData) {
    notFound();
  }

  // 2. Используя найденный ID, запрашиваем все доступные озвучки для этого аниме
  const { data: translations } = await supabase
    .from('translations')
    .select('*')
    .eq('anime_id', animeData.id)
    .order('title'); // Сортируем озвучки по названию

  // 3. Если озвучек нет, показываем красивое сообщение
  if (!translations || translations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center text-white">
        <div>
          <h2 className="text-2xl font-bold">Озвучки не найдены</h2>
          <p className="text-slate-400 mt-2">К сожалению, для этого аниме пока нет доступных плееров.</p>
          <Link href={`/anime/${params.id}`} className="mt-4 inline-flex items-center text-purple-400 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к описанию
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Навигация */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/anime/${params.id}`} className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-white font-semibold">{animeData.title}</h1>
            </div>
          </div>
        </div>
      </div>
      
      {/* 4. Рендерим наш интерактивный клиентский компонент, передавая ему все данные */}
      <PlayerClient anime={animeData} translations={translations} />
    </div>
  );
}
