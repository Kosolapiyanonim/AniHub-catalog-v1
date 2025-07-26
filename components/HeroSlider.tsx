// components/HeroSlider.tsx

"use client"

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

// Интерфейс для данных, которые приходят из data-fetcher
interface HeroAnime {
  id: number;
  shikimori_id: string;
  title: string;
  description: string;
  poster_url: string;
  year: number;
  shikimori_rating: number;
  raw_data?: { // raw_data может отсутствовать
    material_data?: {
      anime_kind?: string;
      duration?: number;
      aired_at?: string;
      episodes_aired?: number;
      episodes_total?: number;
    }
  }
}

interface HeroSliderProps {
  animes?: HeroAnime[] | null;
}

// Вспомогательные функции для форматирования данных
const formatKind = (kind?: string) => {
  if (!kind) return { icon: <Film />, text: "Фильм" };
  const map: Record<string, { icon: React.ReactNode; text: string }> = {
    tv: { icon: <Tv />, text: "ТВ Сериал" },
    movie: { icon: <Film />, text: "Фильм" },
    ova: { icon: <Film />, text: "OVA" },
    ona: { icon: <Film />, text: "ONA" },
    special: { icon: <Film />, text: "Спешл" },
  };
  return map[kind] || { icon: <Film />, text: kind };
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("ru-RU", { year: 'numeric', month: 'long' });
};

export function HeroSlider({ animes }: HeroSliderProps) {
  if (!animes || animes.length === 0) {
    return (
      <div className="relative w-full h-[70vh] rounded-xl bg-slate-800 flex items-center justify-center">
        <p className="text-white">Нет аниме для отображения в слайдере.</p>
      </div>
    );
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % animes.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + animes.length) % animes.length);

  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [animes.length, currentSlide]);

  const currentAnime = animes[currentSlide];
  if (!currentAnime) return null;

  const material = currentAnime.raw_data?.material_data;
  const kindInfo = formatKind(material?.anime_kind);
  const airedDate = formatDate(material?.aired_at);
  const episodesAired = material?.episodes_aired || 0;
  const episodesTotal = material?.episodes_total || 0;
  
  let episodeText = "";
  if (episodesTotal === 1) {
    episodeText = "Полнометражное";
  } else if (episodesAired > 0 && episodesTotal > 0) {
    episodeText = `Вышло ${episodesAired} из ${episodesTotal}`;
  } else if (episodesTotal > 0) {
    episodeText = `${episodesTotal} эп.`;
  }

  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-xl group">
      {/* Фоновое изображение */}
      <div className="absolute inset-0">
        <Image src={currentAnime.poster_url} alt={currentAnime.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Контент */}
      <div className="relative h-full flex items-center container mx-auto px-4 md:px-8">
        <div className="max-w-xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="font-semibold text-purple-400"># {currentSlide + 1} В центре внимания</p>
          <h1 className="text-4xl md:text-5xl font-bold line-clamp-3">{currentAnime.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" />{currentAnime.shikimori_rating}</div>
            <div className="flex items-center gap-2">{kindInfo.icon}{kindInfo.text}</div>
            {material?.duration && <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{material.duration} мин.</div>}
            {airedDate && <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{airedDate}</div>}
          </div>
          
          {episodeText && <Badge variant="secondary">{episodeText}</Badge>}
          
          <p className="line-clamp-3 text-gray-300">{currentAnime.description}</p>
          
          <div className="flex items-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href={`/anime/${currentAnime.shikimori_id}/watch`}><Play className="w-5 h-5 mr-2" />Смотреть сейчас</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/anime/${currentAnime.shikimori_id}`}>Детальнее</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Кнопки навигации */}
      {animes.length > 1 && <>
        <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={prevSlide}><ChevronLeft /></Button>
        <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={nextSlide}><ChevronRight /></Button>
      </>}
    </div>
  );
}
