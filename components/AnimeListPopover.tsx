"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from 'sonner';
import { useSupabase } from './supabase-provider';
import { Check, Loader2, Bookmark } from 'lucide-react';

const statuses = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "В планах" },
  { key: "completed", label: "Просмотрено" },
];

interface AnimeData {
  id: number;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
  status?: string;
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

  useEffect(() => {
    setCurrentStatus(anime.user_list_status);
  }, [anime.user_list_status]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) {
      toast.error("Нужно войти в аккаунт");
      return;
    }
    setLoadingStatus(newStatus);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: anime.id, status: newStatus }),
      });
      if (!response.ok) throw new Error("Ошибка обновления статуса");
      
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      if (onStatusChange) {
        onStatusChange(newResolvedStatus);
      }
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoadingStatus(null);
      setIsOpen(false);
    }
  };
  
  if (!session) {
      return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onMouseEnter={() => setIsOpen(true)}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-slate-800 border-slate-700 text-white p-0" 
        onMouseLeave={() => setIsOpen(false)}
        side="right" 
        align="start"
        sideOffset={10}
      >
        <div className="flex space-x-4 p-4">
          <div className="w-20 h-28 relative shrink-0">
            <Image
              src={anime.poster_url || "/placeholder.svg"}
              alt={anime.title}
              fill
              sizes="80px"
              className="object-cover rounded"
            />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold line-clamp-2">{anime.title}</h4>
            <p className="text-sm text-gray-400 capitalize">
              {anime.type?.replace('_', ' ')} • {anime.year}
            </p>
            <p className="text-sm text-gray-400">{anime.status}</p>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700">
            <p className="text-sm font-medium mb-2">Добавить в список</p>
            <div className="grid grid-cols-1 gap-2">
                {statuses.map(status => (
                    <Button
                        key={status.key}
                        variant={currentStatus === status.key ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleStatusChange(status.key)}
                        disabled={loadingStatus === status.key}
                        className="justify-start"
                    >
                        <Bookmark className="h-4 w-4 mr-2" />
                        {loadingStatus === status.key ? "Сохранение..." : status.label}
                        {currentStatus === status.key && <Check className="h-4 w-4 ml-auto text-green-500" />}
                    </Button>
                ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
