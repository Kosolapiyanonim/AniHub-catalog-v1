// components/AnimeListPopover.tsx
"use client";

import { useState, useEffect, useRef } from 'react'; // <--- ИСПРАВЛЕНИЕ: Добавлен useRef
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from './ui/badge';
import Link from 'next/link';
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';
import { Check, Loader2, Bookmark, Info, Star, Eye, CalendarCheck, XCircle, History, Clock, Plus, Trash2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getLoginUrl } from '@/lib/auth-utils';

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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(anime.user_list_status);
  const [loading, setLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentStatus(anime.user_list_status);
  }, [anime.user_list_status]);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when popover is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoading(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: anime.id, status: newStatus }),
        credentials: 'include',
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
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 50);
  };

  const statusInfo = session && currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-96 bg-popover backdrop-blur-lg border border-border text-popover-foreground p-0 shadow-2xl rounded-xl overflow-hidden dark:bg-popover/98 dark:border-border/50" 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        side="right" align="start" sideOffset={12}
      >
        <div className="max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-popover backdrop-blur-sm p-4 border-b border-border/30 flex items-start justify-between gap-3 dark:bg-gradient-to-b dark:from-popover dark:to-popover/95">
            <div className="flex-1 pr-2">
              <h4 className="font-bold text-base leading-tight text-foreground">{anime.title}</h4>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                {anime.shikimori_rating && <><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /><span className="font-medium">{anime.shikimori_rating}</span></>}
                {anime.year && <span className="before:content-['•'] before:mr-2">{anime.year}</span>}
                {anime.type && <span className="before:content-['•'] before:mr-2">{anime.type}</span>}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Description */}
            {anime.description && (
              <div className="text-xs leading-relaxed text-muted-foreground space-y-1">
                <p className={!isDescriptionExpanded ? 'line-clamp-2' : ''}>
                  {anime.description}
                </p>
                {(anime.description?.length || 0) > 100 && (
                  <button 
                    className="inline-block text-primary text-[0.65rem] font-semibold hover:underline cursor-pointer"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? "Свернуть" : "Еще"}
                  </button>
                )}
              </div>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.slice(0, 4).map(g => (
                  <Badge key={g.name} variant="secondary" className="text-xs">{g.name}</Badge>
                ))}
              </div>
            )}

            <div className="h-px bg-border/30" />

            {/* Status Section */}
            {session ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Мой статус</div>
                <div className="grid grid-cols-3 gap-2">
                  {statuses.slice(0, 3).map(status => (
                    <Button 
                      key={status.key} 
                      variant={currentStatus === status.key ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleStatusChange(status.key)}
                      disabled={loading}
                      className="h-8 text-xs"
                    >
                      <status.icon className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">{status.label}</span>
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {statuses.slice(3).map(status => (
                    <Button 
                      key={status.key} 
                      variant={currentStatus === status.key ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleStatusChange(status.key)}
                      disabled={loading}
                      className="h-8 text-xs"
                    >
                      <status.icon className="h-3.5 w-3.5 mr-1" />
                      <span className="hidden sm:inline">{status.label}</span>
                    </Button>
                  ))}
                </div>
                {currentStatus && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleStatusChange("remove")}
                    disabled={loading}
                    className="w-full h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Удалить
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <p className="text-xs text-muted-foreground">Войдите в аккаунт</p>
                <p className="text-[0.7rem] text-muted-foreground/70">чтобы добавить в список</p>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                  <Link href={getLoginUrl(pathname)}>
                    <Plus className="h-3 w-3 mr-1" />Войти
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 p-3 bg-popover/70 dark:bg-popover/50">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
              <Link href={`/anime/${anime.shikimori_id}`}>
                <Info className="h-3.5 w-3.5 mr-1.5" />Подробнее
              </Link>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
