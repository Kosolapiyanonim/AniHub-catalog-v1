// /components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AnimeHoverCard } from './AnimeHoverCard'; // <-- Импортируем новый компонент

// Убеждаемся, что интерфейс включает все поля, необходимые для AnimeHoverCard
interface AnimeCardProps {
  anime: any; 
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link href={`/anime/${anime.shikimori_id}`} className="block group">
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
            {anime.poster_url ? (
              <Image
                src={anime.poster_url}
                alt={anime.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs p-2">Постер отсутствует</div>
            )}
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">{anime.title}</h3>
            {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-slate-800 border-slate-700 text-white p-0" side="right" align="start" sideOffset={10}>
        <AnimeHoverCard anime={anime} />
      </HoverCardContent>
    </HoverCard>
  );
}
