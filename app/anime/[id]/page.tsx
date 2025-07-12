// /app/anime/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Calendar, Play, Clock, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AddToListButton } from "@/components/AddToListButton"; // <-- ИМПОРТ НОВОГО КОМПОНЕНТА

// Обновленный интерфейс для данных аниме
interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  title_english?: string;
  title_japanese?: string;
  description?: string;
  poster_url?: string;
  year?: number;
  shikimori_rating?: number; // Используем конкретный рейтинг
  status?: string;
  episodes_count?: number;
  duration?: number;
  genres: Array<{ name: string }>;
  studios: Array<{ name:string }>;
  translations: Array<{
    id: number;
    title: string;
    type: string;
    quality: string;
    episodes_count: number;
  }>;
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
      try {
        setLoading(true);
        setError(null);

        // Используем новый, более надежный API эндпоинт
        const response = await fetch(`/api/anime/${animeId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Ошибка сервера" }));
          throw new Error(errorData.error || `Ошибка загрузки: ${response.statusText}`);
        }

        const data = await response.json();
        setAnime(data);
      } catch (err) {
        console.error("Error fetching anime:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [animeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка загрузки</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Аниме не найдено</h1>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const hasTranslations = anime.translations && anime.translations.length > 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-gray-300 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка: Постер и информация */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-20">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={anime.poster_url || "/placeholder.svg?height=600&width=450"}
                    alt={anime.title}
                    fill
                    className="object-cover rounded-t-lg"
                    priority
                  />
                </div>

                <div className="p-4 space-y-3">
                  {hasTranslations ? (
                    <Link href={`/anime/${animeId}/watch`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Смотреть сейчас
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      <Clock className="w-4 h-4 mr-2" />
                      Скоро будет доступно
                    </Button>
                  )}
                  
                  {/* НАША НОВАЯ КНОПКА ЗДЕСЬ */}
                  <AddToListButton animeId={anime.id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка: Основная информация */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Заголовок */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{anime.title}</h1>
                {anime.title_english && anime.title_english !== anime.title && (
                  <p className="text-xl text-gray-300 mb-2">{anime.title_english}</p>
                )}
                {anime.title_japanese && <p className="text-lg text-gray-400">{anime.title_japanese}</p>}
              </div>

              {/* Краткая информация */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400">
                {anime.shikimori_rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-white">{anime.shikimori_rating}</span>
                  </div>
                )}
                {anime.year && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-white">{anime.year}</span>
                  </div>
                )}
                {anime.status && (
                    <Badge variant="secondary">{anime.status}</Badge>
                )}
              </div>

              {/* Жанры */}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre.name} variant="outline" className="border-purple-500 text-purple-300">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Описание */}
              {anime.description && (
                <div>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <p className="text-gray-300 leading-relaxed">{anime.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Студии */}
              {anime.studios && anime.studios.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Студии</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <Badge key={studio.name} variant="outline" className="border-blue-500 text-blue-300">
                        {studio.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Озвучки */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Доступные озвучки</h3>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    {hasTranslations ? (
                      <div className="space-y-2">
                        <p className="text-gray-300 mb-3">
                          Всего доступно: <span className="text-white font-semibold">{anime.translations.length}</span> озвучек
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {anime.translations.slice(0, 6).map((translation) => (
                            <div
                              key={translation.id}
                              className="flex items-center justify-between p-2 bg-slate-700 rounded"
                            >
                              <span className="text-sm text-gray-300 truncate">{translation.title}</span>
                              <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                                {translation.quality}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {anime.translations.length > 6 && (
                          <p className="text-sm text-gray-400 mt-2">И еще {anime.translations.length - 6}...</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Озвучки пока недоступны</p>
                        <p className="text-sm text-gray-500">Мы работаем над добавлением озвучек для этого аниме</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
