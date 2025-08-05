// components/HeroSlider.tsx
"use client"

import React, { useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Play, Info, Star, Clapperboard, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  background_image_url?: string | null; // Из Shikimori или Kodik screenshots
  year?: number | null;
  description?: string;
  type?: string;
  episodes_aired?: number | null;
  episodes_total?: number | null;
  status?: string | null;
  shikimori_rating?: number;
}

interface HeroSliderProps {
  items?: Anime[] | null;
}

export function HeroSlider({ items }: HeroSliderProps) {
  const plugin = useRef(Autoplay({ delay: 7000, stopOnInteraction: true }));
  const validItems = items?.filter(Boolean) as Anime[];

  if (!validItems || validItems.length === 0) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white">
        <p className="text-center text-xl">Отметьте аниме в базе для отображения в Hero-секции...</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full h-screen relative overflow-hidden"
      opts={{ loop: validItems.length > 1 }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="h-full m-0">
        {validItems.map((anime, index) => {
          // Определяем URL фона с приоритетом
          const backgroundImageUrl = anime.background_image_url || anime.poster_url || '/placeholder-hero-bg.jpg';
          
          // Логика для отображения статуса эпизодов
          let episodeStatusText = "";
          if (anime.episodes_total === 1 && anime.episodes_aired === 1) {
            episodeStatusText = "Полнометражное";
          } else if (anime.episodes_total != null && anime.episodes_aired != null) {
            if (anime.episodes_aired < anime.episodes_total) {
              episodeStatusText = `${anime.episodes_aired} из ${anime.episodes_total} эп.`;
            } else {
              episodeStatusText = `${anime.episodes_total} эп.`;
            }
          } else if (anime.episodes_aired != null) {
             episodeStatusText = `${anime.episodes_aired} эп.`;
          }

          return (
            <CarouselItem key={anime.id} className="h-full w-full p-0">
              {/* Фоновое изображение, растянутое на весь экран */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={backgroundImageUrl}
                  alt={`${anime.title} background`}
                  fill
                  className="object-cover scale-105 transition-transform duration-1000 ease-in-out"
                  priority={index === 0}
                  sizes="100vw"
                />
                {/* Многослойные оверлеи для глубины и читаемости текста */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-slate-900/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent"></div>
                {/* Небольшой затемненный оверлей по краям для эффекта "вьюпорта" */}
                <div className="absolute inset-0 shadow-[inset_0_0_200px_50px_rgba(0,0,0,0.9)] pointer-events-none"></div>
              </div>

              {/* Контент слайда */}
              <div className="relative z-10 h-full w-full flex flex-col md:flex-row items-center justify-center md:justify-start p-4 sm:p-8 md:p-16 lg:p-24">
                
                {/* Левая часть: Информация (центрирована на мобильных) */}
                <div className="w-full md:w-2/3 lg:w-1/2 text-center md:text-left text-white">
                  <div className="max-w-2xl mx-auto md:mx-0">
                    <p className="font-semibold text-purple-400 mb-2 text-sm md:text-base"># {index + 1} В центре внимания</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{anime.title}</h1>
                    
                    {/* Метаданные */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-gray-300 mb-4 text-sm md:text-base">
                      {anime.shikimori_rating && (
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /><span>{anime.shikimori_rating.toFixed(1)}</span></div>
                      )}
                      {anime.year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{anime.year}</span>}
                      {anime.type && <Badge variant="secondary" className="text-xs">{anime.type.replace(/_/g, " ")}</Badge>}
                      {episodeStatusText && (
                        <div className="flex items-center gap-1"><Clapperboard className="w-4 h-4" /><span>{episodeStatusText}</span></div>
                      )}
                      {anime.status && <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">{anime.status}</Badge>}
                    </div>
                    
                    {/* Описание */}
                    {anime.description && (
                      <p className="text-gray-300 mb-6 line-clamp-3 text-sm md:text-base opacity-90">{anime.description}</p>
                    )}
                    
                    {/* Кнопки */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <Link href={`/anime/${anime.shikimori_id}/watch`}>
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105">
                          <Play className="w-5 h-5 mr-2" />Смотреть
                        </Button>
                      </Link>
                      <Link href={`/anime/${anime.shikimori_id}`}>
                        <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-300">
                          <Info className="w-5 h-5 mr-2" />Подробнее
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Правая часть: Постер (только на больших экранах) */}
                <div className="hidden md:flex w-1/3 lg:w-1/2 h-full items-center justify-center p-8 md:p-16">
                  <div className="relative w-64 h-96 sm:w-72 sm:h-[32rem] md:w-80 md:h-[36rem] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform transition-transform duration-700 hover:scale-105">
                    {anime.poster_url ? (
                      <Image
                        src={anime.poster_url}
                        alt={`${anime.title} poster`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 0vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                        <span className="text-slate-500">Нет постера</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      {/* Навигационные кнопки */}
      <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-20 flex gap-2">
        <CarouselPrevious className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-10 h-10 md:w-12 md:h-12" />
        <CarouselNext className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-10 h-10 md:w-12 md:h-12" />
      </div>
      
      {/* Индикаторы (Dots) - Центрированы внизу */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        <div className="flex space-x-2">
          {validItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                // Здесь можно добавить логику для перехода к слайду, если нужно
              }}
              className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Carousel>
  );
}