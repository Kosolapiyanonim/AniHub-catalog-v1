// Создайте новый файл: /app/anime/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Tv, Film } from 'lucide-react';

// Определяем типы данных, которые мы ожидаем от нашего API
interface Translation {
  id: number;
  kodik_id: string;
  title: string;
  type: string;
  quality: string;
  player_link: string;
}

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
  translations: Translation[];
}

export default function AnimePage({ params }: { params: { id: string } }) {
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<Translation | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/anime/${params.id}`)
        .then(res => {
          if (res.status === 404) {
            notFound();
          }
          if (!res.ok) {
            throw new Error('Failed to fetch anime data');
          }
          return res.json();
        })
        .then((data: AnimeDetails) => {
          setAnime(data);
          // Устанавливаем первую озвучку как активную по умолчанию
          if (data.translations && data.translations.length > 0) {
            setActiveTranslation(data.translations[0]);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !anime) {
    return <div className="text-center text-red-500 pt-32">Ошибка: Не удалось загрузить данные.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Левая колонка с постером */}
        <aside className="md:col-span-1 lg:col-span-1">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
            <Image
              src={anime.poster_url || '/placeholder.svg'}
              alt={`Постер ${anime.title}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="mt-4 space-y-2">
             {anime.shikimori_rating && (
                <div className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">{anime.shikimori_rating}</span>
                    <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
             )}
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {anime.type === 'anime-serial' ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                <span>{anime.year}</span>
                <span className="font-bold">·</span>
                <span>{anime.status}</span>
             </div>
          </div>
        </aside>

        {/* Правая колонка с информацией и плеером */}
        <main className="md:col-span-2 lg:col-span-3">
          <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres?.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
          </div>
          <p className="text-muted-foreground mb-8">{anime.description || "Описание отсутствует."}</p>

          {/* Плеер */}
          <div className="aspect-video bg-black rounded-lg mb-4">
            {activeTranslation ? (
              <iframe
                src={activeTranslation.player_link}
                frameBorder="0"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Выберите озвучку для просмотра</div>
            )}
          </div>
          
          {/* Переключатель озвучек */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Озвучки:</h3>
            <div className="flex flex-wrap gap-2">
              {anime.translations.map(tr => (
                <Button
                  key={tr.id}
                  variant={activeTranslation?.id === tr.id ? "default" : "outline"}
                  onClick={() => setActiveTranslation(tr)}
                >
                  {tr.title}
                </Button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
