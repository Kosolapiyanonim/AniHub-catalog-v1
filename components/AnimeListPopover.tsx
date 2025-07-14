"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from 'sonner';
import { useSupabase } from './supabase-provider';
import { Check, Loader2, Bookmark, Info, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';

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
  shikimori_id: string;
  title: string;
  title_orig?: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
  status?: string;
  episodes_info: string;
  description?: string;
  genres?: { name: string }[];
  shikimori_rating?: number;
  user_list_status?: string | null;
}

interface AnimeListPopoverProps {
  anime: AnimeData;
  children: React.ReactNode;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
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
      if (onStatusChange) onStatusChange(anime.id, newResolvedStatus);
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
      <PopoverTrigger asChild onMouseEnter={() => setIsOpen(true)}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 bg-slate-800 border-slate-700 text-white p-4 space-y-3" 
        onMouseLeave={() => setIsOpen(false)}
        side="right" align="start" sideOffset={10}
      >
        <h4 className="font-bold text-lg">{anime.title}</h4>
        {anime.title_orig && <p className="text-sm text-gray-400 -mt-2 mb-2">{anime.title_orig}</p>}
        <p className="text-sm text-gray-400 capitalize">{anime.type?.replace('_', ' ')} • {anime.year}</p>
        <p className="text-sm text-gray-400">{anime.episodes_info} • {anime.status}</p>
        <p 
            className={`text-sm text-gray-300 ${!isDescriptionExpanded && 'line-clamp-3'}`}
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
            {anime.description}
        </p>
        {(anime.description?.length || 0) > 150 && (
            <button className="text-xs text-purple-400 hover:underline" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                {isDescriptionExpanded ? "Свернуть" : "Развернуть"}
            </button>
        )}
        <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 4).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
        </div>
        
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-0 hover:no-underline text-sm font-medium">
                    {currentStatus ? <><Check className="w-4 h-4 mr-2 text-green-500"/>В списке</> : "Добавить в список"}
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2">
                        {statuses.map(status => (
                            <Button key={status.key} variant={currentStatus === status.key ? "secondary" : "ghost"} size="sm" onClick={() => handleStatusChange(status.key)} disabled={loadingStatus === status.key} className="justify-start">
                                <Bookmark className="h-4 w-4 mr-2" />
                                {loadingStatus === status.key ? "..." : status.label}
                                {currentStatus === status.key && <Check className="h-4 w-4 ml-auto text-green-500" />}
                            </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/anime/${anime.shikimori_id}`}><Info className="w-4 h-4 mr-2" />Подробнее</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
