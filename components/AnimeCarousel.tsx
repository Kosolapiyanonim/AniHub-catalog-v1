// /components/AnimeCarousel.tsx
"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AnimeCard } from "./anime-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

// Определяем тип для аниме, который будет использоваться в этом компоненте
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
}

interface AnimeCarouselProps {
  title: string;
  items?: Anime[] | null;
  viewAllLink?: string;
  icon?: React.ReactNode;
}

export function AnimeCarousel({ title, items, viewAllLink, icon }: AnimeCarouselProps) {
  // Если данных нет, не рендерим компонент
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-purple-400">{icon}</div>}
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        </div>
        {viewAllLink && (
          <Button variant="outline" asChild>
            <Link href={viewAllLink} className="flex items-center">
              Смотреть все <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {items.map((anime) => (
            <CarouselItem key={anime.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
              <div className="p-1">
                <AnimeCard anime={anime} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
