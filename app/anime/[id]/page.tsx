// /app/anime/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Play, Check, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AnimeListPopover } from "@/components/AnimeListPopover"; // <-- Импортируем новый компонент

// Интерфейсы для данных, которые мы получаем от нашего API
interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  description?: string;
  year?: number;
  type?: string;
  status?: string;
  shikimori_rating?: number;
  genres: { id: number; name: string; slug: string }[];
  studios: { id: number; name: string; slug: string }[];
  user_list_status?: string | null; // <-- Статус из списка пользователя
  // ... и другие поля, которые отдает ваш API страницы аниме
}

const statuses = [
    { key: "watching", label: "Смотрю" },
    { key: "planned", label: "В планах" },
    { key: "completed", label: "Просмотрено" },
    // ... и другие статусы
];

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

  // Функция для мгновенного обновления статуса на странице без перезагрузки
  const handleStatusUpdate = (newStatus: string | null) => {
      if (anime) {
          setAnime({ ...anime, user_list_status: newStatus });
      }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }
  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Ошибка</h1><p className="text-gray-400 mb-6">{error}</p><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }
  if (!anime) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4"><div><h1 className="text-2xl font-bold text-white mb-4">Аниме не найдено</h1><Button onClick={() => router.back()} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Назад</Button></div></div>;
  }

  const currentStatusLabel = statuses.find(s => s.key === anime.user_list_status)?.label;

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
                    <Link href={`/anime/${animeId}/watch`}><Button className="w-full bg-purple-600 hover:bg-purple-700"><Play className="w-4 h-4 mr-2" />Смотреть</Button></Link>
                    
                    {/* ИЗМЕНЕНИЕ: Заменяем старую кнопку на новый Popover */}
                    <AnimeListPopover anime={anime} onStatusChange={handleStatusUpdate}>
                        <Button variant="outline" className="w-full">
                            {anime.user_list_status ? 
                                <><Check className="w-4 h-4 mr-2 text-green-500" />{currentStatusLabel}</> : 
                                <><Plus className="w-4 h-4 mr-2" />Добавить в список</>
                            }
                        </Button>
                    </AnimeListPopover>

                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Правая колонка */}
          <main className="lg:col-span-3 space-y-8">
            {/* ... (остальная верстка правой колонки остается без изменений) ... */}
          </main>
        </div>
      </div>
    </div>
  );
}
