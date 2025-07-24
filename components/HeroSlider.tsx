// components/HeroSlider.tsx

"use client"

import { useState, useEffect, useRef } from "react"; // <--- ИСПРАВЛЕНИЕ: Добавлены импорты
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface HeroAnime {
  id: number;
  shikimori_id: string;
  title: string;
  description: string;
  poster_url: string;
  year: number;
  shikimori_rating: number; // <-- ИСПРАВЛЕНИЕ: Поле совпадает с данными из базы
  genres: string[];
  status: string;
  episodes_count?: number;
}

interface HeroSliderProps {
  animes?: HeroAnime[] | null;
}

export function HeroSlider({ animes }: HeroSliderProps) {
  if (!animes || animes.length === 0) {
    return (
      <div className="relative w-full h-[70vh] md:h-[80vh] rounded-xl bg-slate-800 flex items-center justify-center">
        <p className="text-white">Нет аниме для отображения в слайдере.</p>
      </div>
    );
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % animes.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + animes.length) % animes.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    if (isAutoPlaying && animes.length > 1) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, animes.length, currentSlide]);

  const currentAnime = animes[currentSlide];
  if (!currentAnime) return null; // Дополнительная защита

  return (
    <div
      className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out">
        <Image src={currentAnime.poster_url || "/placeholder.jpg"} alt={currentAnime.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-3xl">
            <div key={currentAnime.id} className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight line-clamp-3">
                {currentAnime.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{currentAnime.year}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full border border-yellow-400/30">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">{currentAnime.shikimori_rating}</span>
                </div>
                {currentAnime.episodes_count && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{currentAnime.episodes_count} эп.</span>
                  </div>
                )}
                <Badge variant="outline" className="px-3 py-1.5 bg-green-500/20 border-green-400/30 text-green-300 font-medium capitalize">
                  {currentAnime.status}
                </Badge>
              </div>
              <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-2xl line-clamp-3">
                {currentAnime.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                <Button asChild size="lg" className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:scale-105">
                  <Link href={`/anime/${currentAnime.shikimori_id}/watch`}>
                    <Play className="w-5 h-5 mr-2" />Смотреть
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="group bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-105">
                  <Link href={`/anime/${currentAnime.shikimori_id}`}>Подробнее</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {animes.length > 1 && (
        <>
          <Button variant="ghost" size="icon" className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 border border-white/20 text-white backdrop-blur-md rounded-full" onClick={prevSlide}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 border border-white/20 text-white backdrop-blur-md rounded-full" onClick={nextSlide}>
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {animes.map((_, index) => (
              <button key={index} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-purple-500" : "w-2 bg-white/40"}`} onClick={() => goToSlide(index)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
