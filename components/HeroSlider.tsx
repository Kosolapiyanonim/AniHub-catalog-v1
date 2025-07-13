// /components/HeroSlider.tsx
"use client";

import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Play, Info, Star, Clapperboard } from "lucide-react";
import { Badge } from "./ui/badge";

// Добавляем screenshots в интерфейс
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  screenshots?: string[] | null;
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
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const validItems = items?.filter(Boolean) as Anime[];

  if (!validItems || validItems.length === 0) {
    return <div className="h-[70vh] bg-slate-800 flex items-center justify-center text-white"><p>Отметьте аниме для Hero-секции...</p></div>;
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
            <div className="relative h-[70vh] w-full">
              {/* ИЗМЕНЕНИЕ: Новая логика выбора изображения */}
              <Image
                src={(anime.screenshots && anime.screenshots.length > 0) ? anime.screenshots[0] : (anime.poster_url || "/placeholder.svg")}
                alt={`${anime.title} background`}
                fill
                className="object-cover object-center"
                priority={index === 0}
                sizes="100vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="relative z-10 container mx-auto h-full flex items-center">
                {/* ... (остальная верстка без изменений) ... */}
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
