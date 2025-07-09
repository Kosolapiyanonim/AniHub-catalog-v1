// /components/HeroSlider.tsx
"use client";

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
import { Play, Info } from "lucide-react";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  genres?: { name: string }[];
  description?: string;
}

interface HeroSliderProps {
  items?: Anime[] | null;
}

export function HeroSlider({ items }: HeroSliderProps) {
  // --- ДИАГНОСТИКА ---
  // Этот лог покажет нам в консоли браузера, какие именно данные пришли в компонент.
  console.log("Data received by HeroSlider:", items);

  if (!items || items.length === 0) {
    return (
      <div className="h-[60vh] bg-slate-800 flex items-center justify-center text-white">
        <p className="text-center">Отметьте аниме в базе данных для отображения в Hero-секции...</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        // ИЗМЕНЕНИЕ: Включаем зацикливание, только если слайдов БОЛЬШЕ ОДНОГО.
        loop: items.length > 1,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: false,
        }),
      ]}
    >
      <CarouselContent>
        {items.map((anime) => (
          <CarouselItem key={anime.id}>
            <div className="relative h-[60vh] w-full">
              <Image
                src={anime.poster_url || "/placeholder.svg"}
                alt={`${anime.title} background`}
                fill
                className="object-cover blur-md scale-110"
              />
              <div className="absolute inset-0 bg-black/60" />

              <div className="relative z-10 container mx-auto h-full flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="hidden md:block md:col-span-1">
                    <Image
                      src={anime.poster_url || "/placeholder.svg"}
                      alt={anime.title}
                      width={300}
                      height={450}
                      className="rounded-lg shadow-2xl"
                    />
                  </div>
                  <div className="md:col-span-2 text-white text-center md:text-left">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">{anime.title}</h1>
                    <p className="text-lg text-gray-300 mb-2">
                      {anime.year}
                    </p>
                    {/* ИЗМЕНЕНИЕ: Добавлена проверка на наличие описания */}
                    {anime.description && (
                      <p className="text-gray-200 mb-6 max-w-2xl line-clamp-3 text-ellipsis">
                        {anime.description}
                      </p>
                    )}
                    <div className="flex justify-center md:justify-start gap-4">
                      <Link href={`/anime/${anime.shikimori_id}/watch`}>
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                          <Play className="w-5 h-5 mr-2" />
                          Смотреть
                        </Button>
                      </Link>
                      <Link href={`/anime/${anime.shikimori_id}`}>
                        <Button size="lg" variant="outline">
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
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
    </Carousel>
  );
}
