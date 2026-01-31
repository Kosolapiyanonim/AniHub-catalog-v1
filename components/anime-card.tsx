// components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimeListPopover } from './AnimeListPopover';
import { AnimeCardListButton } from './anime-card-list-button';
import { Progress } from './ui/progress'; // <-- [ИЗМЕНЕНИЕ] Импортируем прогресс-бар

const formatAnimeType = (type: string | null | undefined): string => {
    if (!type) return '';
    const typeMap: { [key: string]: string } = { 'tv_series': 'Сериал', 'movie': 'Фильм', 'ova': 'OVA', 'ona': 'ONA', 'special': 'Спешл', 'anime-serial': 'Аниме сериал', 'anime': 'Полнометражное' };
    return typeMap[type.toLowerCase()] || type;
};

interface AnimeCardProps {
  anime: any; 
  priority?: boolean;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
}

export function AnimeCard({ anime, priority = false, onStatusChange }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null;
  }
  
  // --- [ИЗМЕНЕНИЕ] Вычисляем прогресс, если он есть ---
  const progressPercent = anime.progress && anime.episodes_total 
    ? (anime.progress / anime.episodes_total) * 100 
    : null;

  return (
    <AnimeListPopover anime={anime} onStatusChange={onStatusChange}>
      <Link href={`/anime/${anime.shikimori_id}`} className="block group">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-card relative shadow-md shadow-black/20 ring-1 ring-border/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:ring-primary/30">
          <AnimeCardListButton
            animeId={anime.id}
            initialStatus={anime.user_list_status}
            onStatusChange={(animeId, newStatus) => onStatusChange?.(animeId, newStatus)}
          />
          {anime.poster_url ? (
              <Image
                  src={anime.poster_url}
                  alt={anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={priority}
              />
          ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-2">Постер отсутствует</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {progressPercent !== null && <Progress value={progressPercent} />}
        </div>
        <div className="mt-3">
            <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">{anime.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
                {formatAnimeType(anime.type)}
                {anime.year && anime.type ? ' • ' : ''}
                {anime.year}
            </p>
        </div>
      </Link>
    </AnimeListPopover>
  );
}
