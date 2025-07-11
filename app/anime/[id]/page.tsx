// /app/anime/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Calendar, Play, Clock, Users, Tv, Film } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AddToListButton } from "@/components/AddToListButton";
import { AnimeCard } from "@/components/anime-card";

// Обновляем интерфейсы данных
interface Translation {
  id: number;
  title: string;
  type: string;
  quality: string;
}
interface RelatedAnime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  type?: string;
  year?: number;
  relation_type: string;
}
interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  title_english?: string;
  title_japanese?: string;
  description?: string;
  poster_url?: string;
  year?: number;
  status?: string;
  episodes_count?: number;
  shikimori_rating?: number;
  genres: { name: string }[];
  studios: { name: string }[];
  translations: Translation[];
  related: RelatedAnime[];
}

export default function AnimePage() {
  const params = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const animeId = params.id as string;

  useEffect(() => {
    const fetchAnime = async () => {
      if (!animeId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/anime/${animeId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ошибка загрузки аниме");
        }
        const data = await response.json();
        setAnime(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [animeId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Ошибка</h1><p className="text-gray-400 mb-6">{error}</p><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }
  if (!anime) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Аниме не найдено</h1><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }

  const hasTranslations = anime.translations && anime.translations.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] relative">
                    <Image src={anime.poster_url || "/placeholder.svg"} alt={anime.title} fill className="object-cover rounded-t-lg" priority />
                  </div>
                  <div className="p-4 space-y-3">
                    {hasTranslations ? (
                      <Link href={`/anime/${animeId}/watch`}><Button className="w-full bg-purple-600 hover:bg-purple-700"><Play className="w-4 h-4 mr-2" />Смотреть</Button></Link>
                    ) : (
                      <Button disabled className="w-full"><Clock className="w-4 h-4 mr-2" />Скоро</Button>
                    )}
                    <AddToListButton animeId={anime.id} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Правая колонка */}
          <main className="lg:col-span-3 space-y-8">
            {/* Заголовок и мета */}
            <section>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{anime.title}</h1>
              {anime.title_english && <p className="text-xl text-gray-300 mt-1">{anime.title_english}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 mt-4">
                {anime.shikimori_rating && <div className="flex items-center"><Star className="w-4 h-4 text-yellow-500 mr-1" />{anime.shikimori_rating}</div>}
                {anime.year && <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{anime.year}</div>}
                {anime.episodes_count && <div className="flex items-center"><Tv className="w-4 h-4 mr-1" />{anime.episodes_count} эп.</div>}
                {anime.status && <Badge variant="secondary">{anime.status}</Badge>}
              </div>
            </section>

            {/* Жанры и студии */}
            <section className="flex flex-wrap gap-2">
              {anime.genres.map(g => <Badge key={g.name} variant="outline" className="border-purple-500 text-purple-300">{g.name}</Badge>)}
              {anime.studios.map(s => <Badge key={s.name} variant="outline" className="border-blue-500 text-blue-300">{s.name}</Badge>)}
            </section>
            
            {/* Описание */}
            {anime.description && <section>
                <h2 className="text-2xl font-bold text-white mb-3">Описание</h2>
                <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: anime.description }} />
            </section>}

            {/* Связанные произведения */}
            {anime.related && anime.related.length > 0 && <section>
                <h2 className="text-2xl font-bold text-white mb-4">Связанное</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {anime.related.map(relatedAnime => (
                        <div key={relatedAnime.id}>
                            <AnimeCard anime={relatedAnime} />
                            <p className="text-xs text-center mt-1 text-gray-400">{relatedAnime.relation_type}</p>
                        </div>
                    ))}
                </div>
            </section>}

            {/* Заглушка для комментариев */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">Комментарии</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-gray-500">
                    <p>Раздел с комментариями находится в разработке и скоро появится!</p>
                </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
