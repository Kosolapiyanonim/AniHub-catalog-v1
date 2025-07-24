// components/AnimeListPopover.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from './ui/badge';
import Link from 'next/link';
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';
import { Check, Loader2, Bookmark, Info, Star, Eye, CalendarCheck, XCircle, History, Clock, Plus, Trash2, X } from 'lucide-react';

const statuses = [
    { key: "watching", label: "Смотрю", icon: Eye },
    { key: "planned", label: "В планах", icon: Clock },
    { key: "completed", label: "Просмотрено", icon: CalendarCheck },
    { key: "rewatching", label: "Пересматриваю", icon: History },
    { key: "on_hold", label: "Отложено", icon: Bookmark },
    { key: "dropped", label: "Брошено", icon: XCircle },
];
const statusMap = new Map(statuses.map(s => [s.key, { label: s.label, icon: s.icon }]));

interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  year?: number | null;
  type?: string;
  status?: string;
  episodes_aired: number;
  episodes_total: number;
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
  const [loading, setLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentStatus(anime.user_list_status);
  }, [anime.user_list_status]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoading(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: anime.id, status: newStatus }),
      });
      if (!response.ok) throw new Error("Server error");
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      if (onStatusChange) onStatusChange(anime.id, newResolvedStatus);
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Небольшая задержка перед закрытием
  };
  
  if (!session) return <>{children}</>;

  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white p-4 space-y-3" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        side="right" align="start" sideOffset={10}
      >
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
        </Button>

        <h4 className="font-bold text-lg pr-6">{anime.title}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-400">
            {anime.shikimori_rating && <><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></>}
            {anime.year && <span>• {anime.year}</span>}
        </div>
        
        <p className={`text-sm text-gray-300 ${!isDescriptionExpanded && 'line-clamp-3'}`}>
            {anime.description || "Описание отсутствует."}
        </p>
        {(anime.description?.length || 0) > 150 && (
            <button className="text-xs text-purple-400 hover:underline" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                {isDescriptionExpanded ? "Свернуть" : "Развернуть"}
            </button>
        )}
        
        <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 3).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
        </div>
        
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-0 hover:no-underline text-sm font-medium rounded-md hover:bg-slate-800 px-2 -mx-2">
                    <div className="flex items-center">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CurrentIcon className="w-4 h-4 mr-2" />}
                        <span>{statusInfo ? statusInfo.label : "Добавить в список"}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                    <div className="grid grid-cols-2 gap-1">
                        {statuses.map(status => (
                            <Button key={status.key} variant={currentStatus === status.key ? "secondary" : "ghost"} size="sm" onClick={() => handleStatusChange(status.key)} className="justify-start">
                                <status.icon className="h-4 w-4 mr-2" />
                                {status.label}
                            </Button>
                        ))}
                    </div>
                    {currentStatus && (
                        <>
                          <div className="my-1 h-px bg-slate-700" />
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange("remove")} className="w-full justify-start text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
                              <Trash2 className="h-4 w-4 mr-2" />Удалить из списка
                          </Button>
                        </>
                    )}
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
