// components/HeroSlider.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
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
  screenshots?: string[]; // Добавляем скриншоты для фона
}

interface HeroSliderProps {
  items?: Anime[] | null;
}

export function HeroSlider({ items }: HeroSliderProps) {
  const plugin = useRef(Autoplay({ delay: 7000, stopOnInteraction: true }));
  const [activeIndex, setActiveIndex] = useState(0);
  const validItems = items?.filter(Boolean) as Anime[];

  // Обработчик смены слайда для анимации
  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  if (!validItems || validItems.length === 0) {
    return (
      <div className="h-[70vh] bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center text-white rounded-lg">
        <div className="text-center p-6">
          <Clapperboard className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <p className="text-xl font-semibold">Отметьте аниме в базе для отображения в Hero-секции</p>
          <p className="text-gray-400 mt-2">Добавьте аниме со статусом "В центре внимания"</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full relative group"
      opts={{ loop: validItems.length > 1 }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      onSelect={handleSelect} // Добавляем обработчик выбора
    >
      <CarouselContent className="ml-0">
        {validItems.map((anime, index) => {
          // Выбираем изображение для фона: сначала скриншот, потом постер
          const backgroundImg = anime.screenshots?.[0] || anime.poster_url;
          
          return (
            <CarouselItem key={anime.id} className="pl-0">
              <div className="relative h-[70vh] w-full overflow-hidden">
                {/* Фоновое изображение с параллаксом */}
                {backgroundImg && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${backgroundImg})`,
                      transform: `scale(1.1) translateX(${(index - activeIndex) * 10}px)`, // Эффект параллакса
                      transition: 'transform 0.8s ease-out'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/70"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  </div>
                )}
                
                {/* Контент */}
                <div className="relative z-10 h-full flex flex-col md:flex-row items-center">
                  {/* Постер */}
                  <div className="w-full md:w-2/5 flex justify-center md:justify-start p-8">
                    <div className={`relative w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-105 ${
                      index === activeIndex ? 'animate-fade-in-up' : ''
                    }`}>
                      {anime.poster_url ? (
                        <Image 
                          src={anime.poster_url} 
                          alt={`${anime.title} poster`} 
                          fill 
                          className="object-cover" 
                          sizes="(max-width: 768px) 50vw, 33vw" 
                          priority={index === 0}
                        />
                      ) : (
                        <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                          <Clapperboard className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
                    </div>
                  </div>
                  
                  {/* Информация с анимацией */}
                  <div className={`w-full md:w-3/5 text-white p-6 md:p-12 flex flex-col justify-center ${
                    index === activeIndex ? 'animate-fade-in-right' : 'opacity-0'
                  }`}>
                    <div className="max-w-2xl">
                      <div className="flex items-center mb-4">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-xs py-1 px-2">
                          #{index + 1} В центре внимания
                        </Badge>
                        <div className="w-2 h-2 bg-purple-500 rounded-full mx-3"></div>
                        <span className="text-sm text-gray-300">{anime.year}</span>
                      </div>
                      
                      <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight line-clamp-2 ${
                        index === activeIndex ? 'animate-fade-in-up delay-100' : 'opacity-0'
                      }`}>
                        {anime.title}
                      </h1>
                      
                      <div className={`flex flex-wrap items-center gap-3 mb-5 ${
                        index === activeIndex ? 'animate-fade-in-up delay-200' : 'opacity-0'
                      }`}>
                        {anime.shikimori_rating && (
                          <div className="flex items-center bg-slate-800/50 px-3 py-1 rounded-full">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="font-semibold">{anime.shikimori_rating.toFixed(1)}</span>
                          </div>
                        )}
                        {anime.type && (
                          <Badge variant="secondary" className="text-xs py-1 px-2">
                            {anime.type.replace(/_/g, " ")}
                          </Badge>
                        )}
                        {anime.episodes_count && (
                          <div className="flex items-center text-sm bg-slate-800/50 px-3 py-1 rounded-full">
                            <Clapperboard className="w-4 h-4 mr-1" />
                            <span>{anime.episodes_count} эп.</span>
                          </div>
                        )}
                      </div>
                      
                      {anime.description && (
                        <p className={`text-gray-300 mb-8 text-base leading-relaxed line-clamp-3 ${
                          index === activeIndex ? 'animate-fade-in-up delay-300' : 'opacity-0'
                        }`}>
                          {anime.description}
                        </p>
                      )}
                      
                      <div className={`flex flex-wrap gap-4 ${
                        index === activeIndex ? 'animate-fade-in-up delay-500' : 'opacity-0'
                      }`}>
                        <Link href={`/anime/${anime.shikimori_id}/watch`}>
                          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 rounded-full px-8 py-6 text-base transition-all duration-300 hover:scale-105">
                            <Play className="w-5 h-5 mr-2" />
                            Смотреть
                          </Button>
                        </Link>
                        <Link href={`/anime/${anime.shikimori_id}`}>
                          <Button 
                            size="lg" 
                            variant="outline" 
                            className="rounded-full px-8 py-6 text-base border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                          >
                            <Info className="w-5 h-5 mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      {/* Навигация */}
      <div className="absolute right-8 bottom-8 z-20 hidden md:flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <CarouselPrevious className="relative static transform-none w-10 h-10 rounded-full border-white/30 hover:bg-white/10" />
        <CarouselNext className="relative static transform-none w-10 h-10 rounded-full border-white/30 hover:bg-white/10" />
      </div>
      
      {/* Индикаторы */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {validItems.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-white w-6' : 'bg-white/30'
            }`}
            data-index={index}
          />
        ))}
      </div>
    </Carousel>
  );
}
