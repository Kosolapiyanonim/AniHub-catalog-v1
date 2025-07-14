// /components/anime-card.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, Check, Bookmark, Trash2 } from "lucide-react";
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';

const statuses = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "В планах" },
  { key: "completed", label: "Просмотрено" },
  { key: "rewatching", label: "Пересматриваю" },
  { key: "on_hold", label: "Отложено" },
  { key: "dropped", label: "Брошено" },
];

interface AnimeCardProps {
  anime: {
    id: number;
    shikimori_id: string;
    title: string;
    poster_url?: string | null;
    year?: number | null;
    user_list_status?: string | null;
  };
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const { session } = useSupabase();
  const [currentStatus, setCurrentStatus] = useState(anime.user_list_status);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentStatus(anime.user_list_status);
  }, [anime.user_list_status]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoading(true);
    try {
      await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: anime.id, status: newStatus }),
      });
      setCurrentStatus(newStatus === 'remove' ? null : newStatus);
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoading(false);
    }
  };

  if (!anime || !anime.shikimori_id) return null;

  return (
    <div className="group relative">
      <Link href={`/anime/${anime.shikimori_id}`} className="cursor-pointer block">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
          {anime.poster_url ? (
            <Image
              src={anime.poster_url} alt={anime.title} fill
              sizes="(max-width: 640px) 50vw, 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs p-2">Постер отсутствует</div>
          )}
        </div>
      </Link>
      
      {session && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => e.stopPropagation()} // Останавливаем клик, чтобы не переходить по ссылке
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 currentStatus ? <Check className="w-4 h-4 text-green-500" /> : 
                 <MoreHorizontal className="w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-slate-800 border-slate-700 text-white">
              {statuses.map((status) => (
                <DropdownMenuItem key={status.key} onSelect={() => handleStatusChange(status.key)} className="cursor-pointer">
                  <Bookmark className="w-4 h-4 mr-2" /><span>{status.label}</span>
                </DropdownMenuItem>
              ))}
              {currentStatus && (
                <><DropdownMenuSeparator className="bg-slate-700" /><DropdownMenuItem className="text-red-500 hover:!text-red-400" onSelect={() => handleStatusChange("remove")}><Trash2 className="w-4 h-4 mr-2" /><span>Удалить из списка</span></DropdownMenuItem></>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="mt-2">
        <Link href={`/anime/${anime.shikimori_id}`} className="cursor-pointer">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">{anime.title}</h3>
        </Link>
        {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
      </div>
    </div>
  );
}
