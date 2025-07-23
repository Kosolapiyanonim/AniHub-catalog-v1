// components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AnimeHoverCard } from './AnimeHoverCard';
import { AnimeCardListButton } from './anime-card-list-button';

const formatAnimeType = (type: string | null | undefined): string => {
    if (!type) return '';
    const typeMap: { [key: string]: string } = { 'tv_series': 'Сериал', 'movie': 'Фильм', 'ova': 'OVA', 'ona': 'ONA', 'special': 'Спешл' };
    return typeMap[type.toLowerCase()] || type;
};

interface AnimeCardProps {
  anime: any; 
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group">
          {/* --- ИЗМЕНЕНИЕ --- */}
          <AnimeCardListButton animeId={anime.id} initialStatus={anime.user_list_status} />
          <Link href={`/anime/${anime.shikimori_id}`} className="block">
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
              {anime.poster_url ? (
                  <Image src={anime.poster_url} alt={anime.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover transition-transform duration-300 group-hover:scale-105" priority={priority} />
              ) : ( <div className="flex items-center justify-center h-full text-slate-500 text-xs p-2">Постер отсутствует</div> )}
              </div>
              <div className="mt-2">
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">{anime.title}</h3>
                  <p className="text-xs text-slate-400">{formatAnimeType(anime.type)}{anime.year && anime.type ? ' • ' : ''}{anime.year}</p>
              </div>
          </Link>
        </div>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={10} className="w-80 p-0 border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <AnimeHoverCard anime={anime} />
      </PopoverContent>
    </Popover>
  );
}
