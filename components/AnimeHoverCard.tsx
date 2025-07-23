// components/AnimeHoverCard.tsx
"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Info } from "lucide-react";
import { AnimeHoverCardListButton } from "./anime-hover-card-list-button";

interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  year?: number | null;
  type?: string;
  description?: string;
  genres?: { name: string }[];
  shikimori_rating?: number;
  user_list_status?: string | null;
}

interface AnimeHoverCardProps {
  anime: AnimeData;
}

export function AnimeHoverCard({ anime }: AnimeHoverCardProps) {
  return (
    <div className="space-y-3 p-4">
      <h3 className="font-bold text-lg">{anime.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {anime.shikimori_rating && <><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></>}
        {anime.year && <span>• {anime.year}</span>}
      </div>
      <p className="text-sm text-gray-300 line-clamp-3">{anime.description || "Описание отсутствует."}</p>
      <div className="flex flex-wrap gap-1">
        {anime.genres?.slice(0, 3).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
      </div>
      {/* --- ИЗМЕНЕНИЕ --- */}
      <AnimeHoverCardListButton animeId={anime.id} initialStatus={anime.user_list_status} />
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href={`/anime/${anime.shikimori_id}`}><Info className="w-4 h-4 mr-2" />Подробнее</Link>
      </Button>
    </div>
  );
}
