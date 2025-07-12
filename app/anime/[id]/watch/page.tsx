// /app/anime/[id]/watch/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Интерфейсы данных
interface Translation {
  id: number;
  title: string;
  type: string;
  link: string;
  episodes_count: number;
}
interface AnimeData {
  id: number;
  title: string;
  translations: Translation[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTranslation, setActiveTranslation] = useState<Translation | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [episodeSearch, setEpisodeSearch] = useState("");

  const animeId = params.id as string;

  useEffect(() => {
    const fetchAnimeData = async () => {
      if (!animeId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/anime/${animeId}`);
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data: AnimeData = await response.json();
        setAnime(data);

        if (data.translations && data.translations.length > 0) {
          setActiveTranslation(data.translations[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeData();
  }, [animeId]);

  const voiceovers = activeTranslation ? anime?.translations.filter(t => t.type === "voice") : [];
  const subtitles = activeTranslation ? anime?.translations.filter(t => t.type === "subtitles") : [];

  const episodes = Array.from({ length: activeTranslation?.episodes_count || 0 }, (_, i) => i + 1);
  const filteredEpisodes = episodes.filter(ep => ep.toString().includes(episodeSearch));

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><LoadingSpinner size="lg"/></div>;
  if (!anime || !activeTranslation) return <div className="min-h-screen bg-slate-900 flex items-center justify-center">Нет данных для просмотра.</div>;

  return (
    <div className="min-h-screen bg-slate-900 pt-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={() => router.push(`/anime/${animeId}`)} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />К описанию
          </Button>
          <h1 className="text-xl font-bold text-white truncate ml-4 text-right">{anime.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
                  <iframe
                    key={`${activeTranslation.id}-${currentEpisode}`}
                    src={`${activeTranslation.link}?episode=${currentEpisode}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
            <div className="text-white mt-4 px-2">
                <h2 className="text-xl font-semibold">{`Эпизод ${currentEpisode}`}</h2>
                <p className="text-sm text-gray-400">{activeTranslation.title}</p>
            </div>
            {/* Заглушка для комментариев к серии */}
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">Комментарии к серии</h3>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-gray-500">
                    <p>Комментарии к этой серии скоро появятся!</p>
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Tabs defaultValue="voice" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="voice">Озвучка</TabsTrigger>
                <TabsTrigger value="subtitles">Субтитры</TabsTrigger>
              </TabsList>
              <TabsContent value="voice">
                <TranslationList translations={voiceovers} active={activeTranslation} setActive={setActiveTranslation} />
              </TabsContent>
              <TabsContent value="subtitles">
                <TranslationList translations={subtitles} active={activeTranslation} setActive={setActiveTranslation} />
              </TabsContent>
            </Tabs>
            
            <Card className="bg-slate-800 border-slate-700 mt-4">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Эпизоды</h3>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Поиск серии..." 
                        className="pl-10 bg-slate-700 border-slate-600"
                        value={episodeSearch}
                        onChange={(e) => setEpisodeSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                  {filteredEpisodes.map((episode) => (
                    <Button
                      key={episode}
                      variant={currentEpisode === episode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentEpisode(episode)}
                    >
                      {episode}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Вспомогательный компонент для списка озвучек, чтобы не дублировать код
function TranslationList({ translations, active, setActive }: { translations: Translation[], active: Translation, setActive: (t: Translation) => void }) {
    if (translations.length === 0) {
        return <div className="text-center text-gray-500 py-4 text-sm">Нет доступных опций.</div>
    }
    return (
        <div className="space-y-2 max-h-48 overflow-y-auto mt-2">
            {translations.map((t) => (
                <Button 
                    key={t.id} 
                    variant={active.id === t.id ? 'secondary' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActive(t)}
                >
                    {t.title}
                </Button>
            ))}
        </div>
    );
}
