// /components/AnimeHoverCard.tsx
"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AddToListButton } from "./AddToListButton";
import { Star, Info } from "lucide-react";

interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  title_orig?: string;
  year?: number | null;
  type?: string;
  status?: string;
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
        {anime.type && <span className="capitalize">• {anime.type.replace(/_/g, ' ')}</span>}
      </div>
      <p className="text-sm text-gray-300 line-clamp-4">
        {anime.description || "Описание отсутствует."}
      </p>
      <div className="flex flex-wrap gap-1">
        {anime.genres?.slice(0, 3).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
      </div>
      <div className="pt-2 space-y-2">
        <AddToListButton animeId={anime.id} initialStatus={anime.user_list_status} />
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/anime/${anime.shikimori_id}`}><Info className="w-4 h-4 mr-2" />Подробнее</Link>
        </Button>
      </div>
    </div>
  );
}
