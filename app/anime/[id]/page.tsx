// /app/anime/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Calendar, Play, Clock, Users, Tv } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AddToListButton } from "@/components/AddToListButton";
import { AnimeCard } from "@/components/anime-card";
import { SubscribeButton } from "@/components/SubscribeButton"; // <-- Импорт

// Обновляем интерфейсы
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
  description?: string;
  poster_url?: string;
  year?: number;
  status?: string;
  episodes_count?: number;
  shikimori_rating?: number;
  genres: { id: number; name: string; slug: string }[]; // <-- Добавляем ID и slug
  studios: { id: number; name: string; slug: string }[];
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
    // ... логика загрузки данных остается без изменений ...
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

  if (loading) { /* ... */ }
  if (error) { /* ... */ }
  if (!anime) { /* ... */ }

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
                    {/* КНОПКА ОЦЕНИТЬ (заглушка) */}
                    <Button variant="secondary" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
                        <Star className="w-4 h-4" /> Оценить
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <Link href={`/anime/${animeId}/watch`}><Button className="w-full bg-purple-600 hover:bg-purple-700"><Play className="w-4 h-4 mr-2" />Смотреть</Button></Link>
                    <AddToListButton animeId={anime.id} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Правая колонка */}
          <main className="lg:col-span-3 space-y-8">
            <section>
              {/* Заголовок и ссылка на Shikimori */}
              <div className="flex items-start gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{anime.title}</h1>
                <a href={`https://shikimori.one/animes/${anime.shikimori_id}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <Image src="/shikimori-logo.svg" alt="Shikimori" width={24} height={24} />
                </a>
              </div>

              {/* Метаданные */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 mt-4">
                {/* ... метаданные (рейтинг, год, и т.д.) ... */}
              </div>

              {/* Новые кнопки действий */}
              <div className="flex items-center gap-2 mt-4">
                <SubscribeButton animeId={anime.id} />
                <Button variant="outline" disabled>
                    Смотреть вместе (скоро)
                </Button>
              </div>
            </section>

            {/* Кликабельные жанры */}
            <section className="flex flex-wrap gap-2">
              {anime.genres.map(g => (
                <Link href={`/catalog?genres=${g.id}-${g.slug}`} key={g.id}>
                    <Badge variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10 cursor-pointer">{g.name}</Badge>
                </Link>
              ))}
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
            {/* ... */}
          </main>
        </div>
      </div>
    </div>
  );
}
