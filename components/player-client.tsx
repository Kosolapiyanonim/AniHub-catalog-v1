'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Определяем типы данных, которые компонент будет получать
interface Translation {
  id: number;
  title: string;
  player_link: string;
  episodes_count: number;
}
interface Anime {
  title: string;
}

interface PlayerClientProps {
  anime: Anime;
  translations: Translation[];
}

export function PlayerClient({ anime, translations }: PlayerClientProps) {
  // Состояния для отслеживания выбранных опций
  const [selectedTranslation, setSelectedTranslation] = useState<Translation>(translations[0]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playerUrl, setPlayerUrl] = useState('');

  // Этот эффект обновляет URL плеера, когда меняется озвучка или эпизод
  useEffect(() => {
    if (selectedTranslation) {
      // Kodik позволяет указать эпизод через параметры ?s=1&e=...
      // Мы берем базовую ссылку и добавляем к ней нужный эпизод.
      const url = new URL(`https:${selectedTranslation.player_link}`);
      url.searchParams.set('e', selectedEpisode.toString());
      // Можно добавить и сезон, если будет такая информация
      // url.searchParams.set('s', '1'); 
      setPlayerUrl(url.toString());
    }
  }, [selectedTranslation, selectedEpisode]);

  const handleTranslationChange = (translationId: string) => {
    const newTranslation = translations.find(t => t.id.toString() === translationId);
    if (newTranslation) {
      setSelectedTranslation(newTranslation);
      // Сбрасываем на 1 эпизод при смене озвучки, если в новой озвучке его нет
      if (selectedEpisode > newTranslation.episodes_count) {
        setSelectedEpisode(1);
      }
    }
  };

  const episodes = Array.from({ length: selectedTranslation.episodes_count || 1 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Видеоплеер */}
        <div className="xl:col-span-3">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <iframe
                  key={playerUrl} // Ключ заставляет iframe перезагружаться при смене URL
                  src={playerUrl}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Озвучка:</span>
                  <Select value={selectedTranslation.id.toString()} onValueChange={handleTranslationChange}>
                    <SelectTrigger className="w-auto md:w-48 bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {translations.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Список эпизодов */}
        <div className="xl:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Эпизоды ({selectedTranslation.episodes_count})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto">
                {episodes.map((ep) => (
                  <button
                    key={ep}
                    onClick={() => setSelectedEpisode(ep)}
                    className={`w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                      ep === selectedEpisode ? "bg-purple-600/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Эпизод {ep}</span>
                      {ep === selectedEpisode && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
