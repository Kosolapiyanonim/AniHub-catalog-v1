// app/anime/[id]/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Play } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AnimeCarousel } from "@/components/AnimeCarousel";
import { SubscribeButton } from "@/components/SubscribeButton";
import { AddToListButton } from "@/components/AddToListButton"; // <-- [ИЗМЕНЕНИЕ] Импортируем нашу универсальную кнопку

// Интерфейсы данных (без изменений)
// ...
interface RelatedAnime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  relation_type_formatted: string;
}
interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  description?: string;
  shikimori_rating?: number;
  genres: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string }[];
  related: RelatedAnime[];
  user_list_status?: string | null;
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
      // ... (логика загрузки данных остается без изменений)
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

  // --- [ИЗМЕНЕНИЕ] Эта функция будет обновлять состояние страницы при смене статуса ---
  const handleStatusUpdate = useCallback((updatedAnimeId: number, newStatus: string | null) => {
      if (anime && anime.id === updatedAnimeId) {
          setAnime({ ...anime, user_list_status: newStatus });
      }
  }, [anime]);

  if (loading) { /* ... (состояния загрузки/ошибки без изменений) ... */ 
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Ошибка</h1><p className="text-gray-400 mb-6">{error}</p><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }
  if (!anime) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Аниме не найдено</h1><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-slate-800">
                <Image src={anime.poster_url || "/placeholder.svg"} alt={anime.title} fill className="object-cover" priority />
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/anime/${animeId}/watch`} className="w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700"><Play className="w-4 h-4 mr-2" />Смотреть</Button>
                </Link>
                <SubscribeButton animeId={anime.id} />
              </div>
              {/* --- [ИЗМЕНЕНИЕ] Используем нашу новую универсальную кнопку --- */}
              <AddToListButton
                  animeId={anime.id}
                  initialStatus={anime.user_list_status}
                  onStatusChange={handleStatusUpdate}
                  variant="full"
              />
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-12">
            {/* ... (остальная часть страницы без изменений) ... */}
            <section>
              <div className="flex items-start justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold text-white pr-4">{anime.title}</h1>
                  <a href={`https://shikimori.one/animes/${anime.shikimori_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 pt-2 shrink-0 text-gray-300 hover:text-white">
                      <span className="font-bold text-lg">{anime.shikimori_rating}</span>
                      <Image src="/shikimori-logo.svg" alt="Shikimori" width={20} height={20} />
                  </a>
              </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-3">О тайтле</h2>
                <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: anime.description || "Описание отсутствует." }} />
                <div className="flex flex-wrap gap-2 mt-4">
                    {anime.genres.map(g => (<Link href={`/catalog?genres=${g.id}-${g.slug}`} key={g.id}><Badge variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10 cursor-pointer">{g.name}</Badge></Link>))}
                    {anime.tags.map(t => (<Link href={`/catalog?tags=${t.id}-${t.slug}`} key={t.id}><Badge variant="secondary">{t.name}</Badge></Link>))}
                </div>
            </section>

            {anime.related && anime.related.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4">Связанное</h2>
                <AnimeCarousel items={anime.related} />
              </section>
            )}
            
            <section>
                <h2 className="text-xl font-bold text-white mb-4">Отзывы</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-gray-500">
                    <p>Раздел в разработке.</p>
                </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
