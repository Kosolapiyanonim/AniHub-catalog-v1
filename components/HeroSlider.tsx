// components/HeroSlider.tsx

"use client"

import React, { useRef } from "react"; // <-- ИСПРАВЛЕНИЕ: правильный импорт
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
}

interface HeroSliderProps {
  items?: Anime[] | null;
}

export function HeroSlider({ items }: HeroSliderProps) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const validItems = items?.filter(Boolean) as Anime[];

  if (!validItems || validItems.length === 0) {
    return (
      <div className="h-[70vh] bg-slate-800 flex items-center justify-center text-white rounded-lg">
        <p className="text-center">Отметьте аниме в базе для отображения в Hero-секции...</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full relative"
      opts={{ loop: validItems.length > 1 }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {validItems.map((anime, index) => (
          <CarouselItem key={anime.id}>
            <div className="relative h-[70vh] w-full flex md:flex-row flex-col bg-slate-900 rounded-lg overflow-hidden">
              <div className="relative z-10 w-full md:w-3/5 flex items-center p-4 sm:p-8 md:pl-16">
                <div className="text-white w-full max-w-lg">
                  <p className="font-semibold text-purple-400 mb-2 text-sm"># {index + 1} В центре внимания</p>
                  <h1 className="text-3xl lg:text-5xl font-bold mb-4 line-clamp-2">{anime.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300 mb-5 text-sm">
                    {anime.shikimori_rating && (
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></div>
                    )}
                    {anime.year && <span>{anime.year}</span>}
                    {anime.type && <Badge variant="secondary">{anime.type.replace(/_/g, " ")}</Badge>}
                    {anime.episodes_count && (
                      <div className="flex items-center gap-1"><Clapperboard className="w-4 h-4" /><span>{anime.episodes_count} эп.</span></div>
                    )}
                  </div>
                  {anime.description && (
                    <p className="text-gray-300 mb-8 line-clamp-3 text-sm md:text-base">{anime.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    <Link href={`/anime/${anime.shikimori_id}/watch`}>
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700"><Play className="w-5 h-5 mr-2" />Смотреть</Button>
                    </Link>
                    <Link href={`/anime/${anime.shikimori_id}`}>
                      <Button size="lg" variant="outline"><Info className="w-5 h-5 mr-2" />Подробнее</Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-2/5 h-full absolute right-0 top-0 md:relative">
                {anime.poster_url && 
                    <Image src={anime.poster_url} alt={`${anime.title} background`} fill className="object-cover opacity-30 blur-2xl" />
                }
                <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/50 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                    {anime.poster_url && 
                        <Image src={anime.poster_url} alt={`${anime.title} poster`} fill className="object-cover" priority={index === 0} sizes="(max-width: 768px) 50vw, 33vw" />
                    }
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute right-8 bottom-8 z-20 hidden md:flex gap-2">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  );
}
