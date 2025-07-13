// /components/HeroSlider.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Play, Info } from "lucide-react";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  description?: string;
}

interface HeroSliderProps {
  initialItems?: Anime[] | null;
}

export function HeroSlider({ initialItems = [] }: HeroSliderProps) {
  // Управляем состоянием слайдов, которые нужно отобразить
  const [items, setItems] = useState(initialItems?.slice(0, 2) || []);

  // После первой загрузки страницы, добавляем остальные слайды с задержкой
  useEffect(() => {
    if (initialItems && initialItems.length > 2) {
      const timer = setTimeout(() => {
        setItems(initialItems); // Устанавливаем полный массив
      }, 2000); // Задержка в 2 секунды

      return () => clearTimeout(timer);
    }
  }, [initialItems]);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (!items || items.length === 0) {
    return (
        <div className="h-[60vh] bg-slate-800 flex items-center justify-center text-white">
            <p>Загрузка Hero-секции...</p>
        </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{ loop: items.length > 1 }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((anime, index) => (
          <CarouselItem key={anime.id}>
            <div className="relative h-[60vh] w-full">
              <Image
                src={anime.poster_url || "/placeholder.svg"}
                alt={`${anime.title} background`}
                fill
                className="object-cover object-center"
                priority={index < 2} // Приоритет только для первых двух слайдов
                sizes="100vw"
                quality={85}
              />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{anime.title}</h1>
                <p className="text-lg md:text-xl max-w-3xl mb-8 line-clamp-3">
                  {anime.description}
                </p>
                <div className="flex gap-4">
                  <Link href={`/anime/${anime.shikimori_id}/watch`}><Button size="lg" className="bg-purple-600 hover:bg-purple-700"><Play className="w-5 h-5 mr-2" />Смотреть</Button></Link>
                  <Link href={`/anime/${anime.shikimori_id}`}><Button size="lg" variant="outline"><Info className="w-5 h-5 mr-2" />Подробнее</Button></Link>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
