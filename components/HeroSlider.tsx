// /components/HeroSlider.tsx
 "use client";

 import React, { useState, useEffect } from "react";
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
   initialItems?: Anime[] | null;
 }

 export function HeroSlider({ initialItems = [] }: HeroSliderProps) {
   const [items, setItems] = useState(initialItems?.slice(0, 2) || []);

   useEffect(() => {
     if (initialItems && initialItems.length > 2) {
       const timer = setTimeout(() => {
         setItems(initialItems);
       }, 2000);

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
       className="w-full relative" // Добавил relative для позиционирования кнопок
       opts={{ loop: items.length > 1 }}
       plugins={[plugin.current]}
       onMouseEnter={plugin.current.stop}
       onMouseLeave={plugin.current.reset}
     >
       <CarouselContent>
         {items.map((anime, index) => (
           <CarouselItem key={anime.id}>
             <div className="relative h-[70vh] w-full">
               <Image
                 src={anime.poster_url || "/placeholder.svg"}
                 alt={`${anime.title} background`}
                 fill
                 className="object-cover object-center md:object-right"
                 priority={index < 2}
                 sizes="100vw"
                 quality={85}
               />
               <div className="absolute inset-0 bg-black/60" />
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
                   <p className="text-gray-200 mb-8 max-w-xl line-clamp-3">
                     {anime.description}
                   </p>
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
       {/* ВОТ ЭТИ СТРОКИ БЫЛИ УДАЛЕНЫ */}
       <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
       <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
     </Carousel>
   );
 }
