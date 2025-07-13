// /components/HeroSlider.tsx
 "use client";
 
 import React from "react";
 import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
 import Autoplay from "embla-carousel-autoplay";
 import Image from "next/image";
 import Link from "next/link";
 import { Button } from "./ui/button";
 import { Play, Info, Star } from "lucide-react";
 import { Badge } from "./ui/badge";
 
 interface Anime {
   id: number;
   shikimori_id: string;
   title: string;
   poster_url?: string | null;
   year?: number | null;
   description?: string;
   type?: string;
   shikimori_rating?: number;
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
             <div className="relative h-[70vh] w-full flex md:flex-row flex-col bg-slate-900">
               {/* Левая часть с градиентом и информацией */}
               <div className="relative z-10 w-full md:w-3/5 lg:w-1/2 flex items-center p-4 sm:p-8">
                 <div className="text-white w-full max-w-lg">
                   <p className="font-semibold text-purple-400 mb-2 text-sm"># {index + 1} В центре внимания</p>
                   <h1 className="text-2xl lg:text-4xl font-bold mb-3 line-clamp-2">{anime.title}</h1>
                   <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300 mb-4 text-sm">
                     {anime.shikimori_rating && (<div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></div>)}
                     {anime.year && <span>{anime.year}</span>}
                     {anime.type && <Badge variant="secondary">{anime.type.replace('_', ' ')}</Badge>}
                   </div>
                   <p className="text-gray-300 mb-6 line-clamp-3 text-sm md:text-base">{anime.description}</p>
                   <div className="flex items-center gap-4">
                     <Link href={`/anime/${anime.shikimori_id}/watch`}><Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Play className="w-4 h-4 mr-2" />Смотреть</Button></Link>
                     <Link href={`/anime/${anime.shikimori_id}`}><Button size="sm" variant="outline"><Info className="w-4 h-4 mr-2" />Подробнее</Button></Link>
                   </div>
                 </div>
               </div>
 
               {/* Правая часть с постером */}
               <div className="w-full md:w-2/5 lg:w-1/2 h-full flex justify-center items-center relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                 <div className="relative w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 rounded-lg overflow-hidden shadow-2xl z-10 translate-y-6 md:translate-y-0">
                   <Image
                     src={anime.poster_url || "/placeholder.svg"}
                     alt={`${anime.title} poster`}
                     fill
                     className="object-cover"
                     priority={index === 0}
                     sizes="(max-width: 768px) 50vw, 33vw"
                     quality={90}
                   />
                 </div>
               </div>
             </div>
           </CarouselItem>
         ))}
       </CarouselContent>
       <div className="absolute right-8 bottom-8 z-20 hidden md:flex gap-2">
         <CarouselPrevious className="bg-black/20 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/40 transition-colors" />
         <CarouselNext className="bg-black/20 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/40 transition-colors" />
       </div>
     </Carousel>
   );
 }
