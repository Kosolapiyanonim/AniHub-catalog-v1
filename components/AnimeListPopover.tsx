// /components/AnimeListPopover.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from 'sonner';
import { useSupabase } from './supabase-provider';
import { Check, Loader2, Bookmark, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';

const statuses = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "В планах" },
  { key: "completed", label: "Просмотрено" },
  { key: "rewatching", label: "Пересматриваю" },
  { key: "on_hold", label: "Отложено" },
  { key: "dropped", label: "Брошено" },
];

interface AnimeData {
  id: number;
  title: string;
  title_orig?: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
  status?: string;
  episodes_aired: number;
  episodes_total: number;
  description?: string;
  genres?: { name: string }[];
  user_list_status?: string | null;
}

interface AnimeListPopoverProps {
  anime: AnimeData;
  children: React.ReactNode;
  onStatusChange?: (newStatus: string | null) => void;
}

export function AnimeListPopover({ anime, children, onStatusChange }: AnimeListPopoverProps) {
  const { session } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(anime.user_list_status);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    setCurrentStatus(anime.user_list_status);
  }, [anime.user_list_status]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoadingStatus(newStatus);
    try {
      await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: anime.id, status: newStatus }),
      });
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      if (onStatusChange) onStatusChange(newResolvedStatus);
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoadingStatus(null);
      setIsOpen(false);
    }
  };
  
  if (!session) return <>{children}</>;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 bg-slate-800 border-slate-700 text-white p-0" 
        onClick={(e) => { e.preventDefault(); e.stopPropagation();}}
        side="right" 
        align="start"
        sideOffset={10}
      >
        <div className="flex space-x-4 p-4">
          <div className="w-24 h-36 relative shrink-0">
            <Image src={anime.poster_url || "/placeholder.svg"} alt={anime.title} fill sizes="96px" className="object-cover rounded" />
          </div>
          <div className="space-y-1 overflow-hidden">
            <h4 className="font-semibold truncate">{anime.title}</h4>
            <p className="text-sm text-gray-400 truncate">{anime.title_orig}</p>
            <p className="text-sm text-gray-400 capitalize">{anime.type?.replace('_', ' ')} • {anime.year}</p>
            <p className="text-sm text-gray-400 capitalize">{anime.status}</p>
            <p className="text-sm text-gray-400">{anime.episodes_aired} / {anime.episodes_total || '??'} эп.</p>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 space-y-3">
            <p 
                className={`text-sm text-gray-300 ${!isDescriptionExpanded && 'line-clamp-3'}`}
            >
                {anime.description}
            </p>
            {(anime.description?.length || 0) > 150 && (
                <Button variant="link" size="sm" className="p-0 h-auto text-purple-400" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                    {isDescriptionExpanded ? "Свернуть" : "Развернуть"}
                </Button>
            )}
            <div className="flex flex-wrap gap-1">
                {anime.genres?.slice(0, 4).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
            </div>
        </div>
        <div className="p-4 border-t border-slate-700">
            <p className="text-sm font-medium mb-2">Добавить в список</p>
            <div className="grid grid-cols-2 gap-2">
                {statuses.map(status => (
                    <Button key={status.key} variant={currentStatus === status.key ? "secondary" : "ghost"} size="sm" onClick={() => handleStatusChange(status.key)} disabled={loadingStatus === status.key} className="justify-start">
                        <Bookmark className="h-4 w-4 mr-2" />
                        {loadingStatus === status.key ? "..." : status.label}
                        {currentStatus === status.key && <Check className="h-4 w-4 ml-auto text-green-500" />}
                    </Button>
                ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
