// /components/AnimeCarousel.tsx
"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AnimeCard } from "./anime-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Flame, TrendingUp, Clock } from "lucide-react";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
}

interface AnimeCarouselProps {
  title: string;
  items?: (Anime | null)[] | null;
  viewAllLink?: string;
  icon?: React.ReactNode;
}

const getTitleIcon = (title: string) => {
  if (title.toLowerCase().includes("популярн")) return <Flame className="w-6 h-6" />;
  if (title.toLowerCase().includes("тренд")) return <TrendingUp className="w-6 h-6" />;
  if (title.toLowerCase().includes("обновлен") || title.toLowerCase().includes("последн")) return <Clock className="w-6 h-6" />;
  return null;
};

export function AnimeCarousel({ title, items, viewAllLink, icon }: AnimeCarouselProps) {
  const validItems = items?.filter(Boolean) as Anime[];
  if (!validItems || validItems.length === 0) return null;

  const displayIcon = icon || getTitleIcon(title);

  return (
    <section className="relative">
      <div className="absolute -left-4 top-0 w-1 h-12 bg-gradient-to-b from-primary to-accent rounded-full hidden md:block" />
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {displayIcon && (
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              {displayIcon}
            </div>
          )}
          <h2 className="text-lg sm:text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight leading-tight">{title}</h2>
        </div>
        {viewAllLink && (
          <Button variant="outline" asChild className="group border-border hover:border-primary hover:bg-primary/10 transition-all h-8 sm:h-10 px-2.5 sm:px-4 text-xs sm:text-sm">
            <Link href={viewAllLink} className="flex items-center gap-1">
              <span className="hidden sm:inline">Смотреть все</span><span className="sm:hidden">Все</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>
      <Carousel 
        opts={{ 
          align: "start", 
          dragFree: true,
          // ИЗМЕНЕНИЕ: Включаем бесконечный скролл
          loop: true,
        }} 
        className="w-full"
      >
        <CarouselContent>
          {validItems.map((anime, index) => (
            <CarouselItem key={anime.id || index} className="basis-[46%] sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
              <div className="p-1"><AnimeCard anime={anime} /></div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
