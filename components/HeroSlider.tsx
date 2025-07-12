// /components/HeroSlider.tsx
"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Play, Info, Star, Clapperboard } from "lucide-react";
import { Badge } from "./ui/badge";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  description?: string;
  type?: string;
  episodes_count?: number;
  shikimori_rating?: number;
  best_quality?: string | null;
}

interface HeroSliderProps {
  items?: Anime[] | null;
}

export function HeroSlider({ items }: HeroSliderProps) {
  // ИСПРАВЛЕНИЕ: Создаем ref для плагина Autoplay для стабильной работы
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  const validItems = items?.filter(Boolean) as Anime[];

  if (!validItems || validItems.length === 0) {
    return (
      <div className="h-[70vh] bg-slate-800 flex items-center justify-center text-white">
        <p className="text-center">Отметьте аниме в базе данных для отображения в Hero-секции...</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full relative"
      opts={{ 
        // ИСПРАВЛЕНИЕ: Четкое условие для зацикливания
        loop: validItems.length > 1,
      }}
      plugins={[plugin.current]} // <-- Используем ref
      onMouseEnter={plugin.current.stop} // <-- Пауза при наведении
      onMouseLeave={plugin.current.reset} // <-- Возобновление при уходе курсора
    >
      <CarouselContent>
        {validItems.map((anime, index) => (
          <CarouselItem key={anime.id}>
            <div className="relative h-[70vh] w-full">
              <Image
                src={anime.poster_url || "/placeholder.svg"}
                alt={`${anime.title} background`}
                fill
                className="object-cover object-center md:object-right"
                priority={index === 0}
                sizes="100vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="relative z-10 container mx-auto h-full flex items-center">
                <div className="w-full md:w-3/5 lg:w-1/2 text-white">
                  <p className="font-semibold text-purple-400 mb-4"># {index + 1} В центре внимания</p>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 line-clamp-2">{anime.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300 mb-4">
                    {anime.shikimori_rating && (
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></div>
                    )}
                    {anime.year && <span>{anime.year}</span>}
                    {anime.type && <Badge variant="secondary">{anime.type.replace('_', ' ')}</Badge>}
                    {anime.episodes_count && (
                        <div className="flex items-center gap-1"><Clapperboard className="w-4 h-4" /><span>{anime.episodes_count} эп.</span></div>
                    )}
                    {anime.best_quality && <Badge variant="outline">{anime.best_quality}</Badge>}
                  </div>
                  {anime.description && (
                    <p className="text-gray-200 mb-8 max-w-xl line-clamp-3 text-ellipsis">
                      {anime.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <Link href={`/anime/${anime.shikimori_id}/watch`}><Button size="lg" className="bg-purple-600 hover:bg-purple-700"><Play className="w-5 h-5 mr-2" />Смотреть</Button></Link>
                    <Link href={`/anime/${anime.shikimori_id}`}><Button size="lg" variant="outline"><Info className="w-5 h-5 mr-2" />Подробнее</Button></Link>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
    </Carousel>
  );
}
