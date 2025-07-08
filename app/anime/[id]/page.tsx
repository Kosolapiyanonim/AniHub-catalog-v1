// /app/anime/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Импортируем Link
import { notFound, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Tv, Film, ArrowLeft, PlayCircle } from "lucide-react";

// --- Типы данных ---
interface AnimeDetails {
  id: number;
  title: string;
  poster_url?: string;
  description?: string;
  year?: number;
  status?: string;
  type?: string;
  shikimori_rating?: number;
  genres?: string[];
  studios?: string[];
}

// --- Основной компонент страницы деталей ---
export default function AnimePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/anime/${params.id}`)
        .then((res) => {
          if (res.status === 404) notFound();
          if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`);
          return res.json();
        })
        .then((data: AnimeDetails) => setAnime(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !anime) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Ошибка загрузки</h1>
        <p className="text-muted-foreground mb-4">{error || "Не удалось загрузить данные аниме"}</p>
        <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 hover:bg-slate-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к каталогу
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка с постером и информацией */}
          <aside className="lg:col-span-1">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-800 shadow-lg">
              {anime.poster_url ? (
                <Image
                  src={anime.poster_url}
                  alt={`Постер ${anime.title}`}
                  fill
                  className="object-cover"
                  priority // Важно для LCP
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Постер отсутствует</div>
              )}
            </div>

            {/* ИЗМЕНЕНИЕ: Кнопка "Смотреть" */}
            <Button asChild size="lg" className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                <Link href={`/anime/${params.id}/watch`}>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Смотреть
                </Link>
            </Button>

            <div className="mt-6 space-y-4">
              {anime.shikimori_rating && (
                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-current" /><span className="text-lg font-bold">{anime.shikimori_rating}</span><span className="text-sm text-muted-foreground">/ 10</span></div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {anime.type === "anime-serial" ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                {anime.year && <span>{anime.year}</span>}
                {anime.status && <><span>•</span><span>{anime.status}</span></>}
              </div>
            </div>
          </aside>

          {/* Правая колонка с описанием и метаданными */}
          <main className="lg:col-span-3">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{anime.title}</h1>
            
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((genre) => (<Badge key={genre} variant="secondary">{genre}</Badge>))}
              </div>
            )}

            <h3 className="text-xl font-semibold mb-2">Описание</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">{anime.description || "Описание отсутствует."}</p>

            {anime.studios && anime.studios.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Студии:</h3>
                <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (<Badge key={studio} variant="outline">{studio}</Badge>))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
