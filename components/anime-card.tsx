// components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimeListPopover } from './AnimeListPopover';
import { AnimeCardListButton } from './anime-card-list-button';
import { ProgressBar } from './ui/progress'; // <-- [ИЗМЕНЕНИЕ] Импортируем прогресс-бар

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
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
          <AnimeCardListButton animeId={anime.id} initialStatus={anime.user_list_status} onStatusChange={(newStatus) => onStatusChange?.(anime.id, newStatus)} />
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
          {/* --- [ИЗМЕНЕНИЕ] Отображаем прогресс-бар, если он есть --- */}
          {progressPercent !== null && <ProgressBar progress={progressPercent} />}
        </div>
        <div className="mt-2">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">{anime.title}</h3>
            <p className="text-xs text-slate-400">
                {formatAnimeType(anime.type)}
                {anime.year && anime.type ? ' • ' : ''}
                {anime.year}
            </p>
        </div>
      </Link>
    </AnimeListPopover>
  );
}
