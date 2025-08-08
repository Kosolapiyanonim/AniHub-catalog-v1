import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  Play,
  Settings,
  Volume2,
  Maximize,
  MoreHorizontal,
  Star,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayerClient } from "@/components/player-client";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Получаем данные аниме
  const { data: animeData } = await supabase
    .from("animes")
    .select(`
      id, 
      title, 
      title_orig,
      poster_url,
      description,
      year,
      shikimori_rating,
      episodes_total,
      episodes_aired,
      status,
      genres:anime_genres(genres(name)),
      studios:anime_studios(studios(name))
    `)
    .eq("shikimori_id", params.id)
    .single();

  if (!animeData) {
    notFound();
  }

  // Получаем озвучки
  const { data: translations } = await supabase
    .from("translations")
    .select("*")
    .eq("anime_id", animeData.id)
    .order("title");

  if (!translations || translations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Озвучки не найдены
                </h2>
                <p className="text-slate-400 mb-6">
                  К сожалению, для этого аниме пока нет доступных плееров.
                </p>
                <Link href={`/anime/${params.id}`}>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к описанию
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Для простоты, берём первую доступную озвучку и первый эпизод
  const selectedTranslation = translations[0];
  const selectedEpisode = 1;

  // Берём готовую ссылку на плеер из базы
  const playerSrc: string | null = selectedTranslation?.player_link || null;

  if (!playerSrc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Плеер недоступен
                </h2>
                <p className="text-slate-400 mb-6">
                  К сожалению, не удалось загрузить плеер для этого аниме.
                </p>
                <Link href={`/anime/${params.id}`}>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к описанию
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/anime/${params.id}`}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
              <Separator orientation="vertical" className="h-6 bg-slate-600" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative rounded overflow-hidden">
                  <Image
                    src={animeData.poster_url || "/placeholder.svg"}
                    alt={animeData.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                    {animeData.title}
                  </h1>
                  <p className="text-slate-400 text-xs">
                    {animeData.episodes_aired} /{" "}
                    {animeData.episodes_total || "??"} эп.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Плеер */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative group">
                  <PlayerClient
                    src={playerSrc}
                    poster={animeData.poster_url || undefined}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="xl:col-span-1 space-y-6">
            {/* Озвучки */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Озвучки</h3>
                  <p className="text-sm text-slate-400">
                    {translations.length} доступно
                  </p>
                </div>
                <ScrollArea className="h-48">
                  <div className="p-2">
                    {translations.slice(0, 8).map((translation) => (
                      <button
                        key={translation.id}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                          translation.id === selectedTranslation.id
                            ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                            : "hover:bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {translation.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {translation.quality}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {translation.type}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
