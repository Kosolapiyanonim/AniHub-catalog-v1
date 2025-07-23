// components/AddToListButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useSupabase } from './supabase-provider';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Check, Plus, Bookmark, Trash2, Eye, CalendarCheck, XCircle, History, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statuses = [
  { key: "watching", label: "Смотрю", icon: Eye },
  { key: "planned", label: "В планах", icon: Clock },
  { key: "completed", label: "Просмотрено", icon: CalendarCheck },
  { key: "rewatching", label: "Пересматриваю", icon: History },
  { key: "on_hold", label: "Отложено", icon: Bookmark },
  { key: "dropped", label: "Брошено", icon: XCircle },
];

// --- [ИЗМЕНЕНИЕ] Карта иконок для быстрого доступа ---
const statusMap = new Map(statuses.map(s => [s.key, { label: s.label, icon: s.icon }]));

interface AddToListButtonProps {
  animeId: number;
  initialStatus?: string | null;
  variant?: 'full' | 'icon';
  className?: string;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
}

export function AddToListButton({ animeId, initialStatus, variant = 'full', className, onStatusChange }: AddToListButtonProps) {
  const { session } = useSupabase();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoading(true);
    try {
      // ... (логика запроса остается той же)
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: animeId, status: newStatus }),
      });
      if (!response.ok) throw new Error("Server error");
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      if (onStatusChange) onStatusChange(animeId, newResolvedStatus);
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoading(false);
      setPopoverOpen(false); // Закрываем popover после выбора
    }
  };

  if (!session) {
    if (variant === 'icon') return null;
    return (
        <Link href="/login" className={cn("w-full", className)}>
            <Button variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Добавить в список</Button>
        </Link>
    );
  }
  
  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  // --- [ИЗМЕНЕНИЕ] Новая логика рендеринга для кнопки на странице аниме ---
  if (variant === 'full') {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full", className)} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><CurrentIcon className="w-4 h-4 mr-2" />{statusInfo ? statusInfo.label : 'Добавить в список'}</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 bg-slate-800 border-slate-700 text-white">
          <div className="grid grid-cols-1 gap-1">
            {statuses.map((status) => (
              <Button key={status.key} variant={currentStatus === status.key ? "secondary" : "ghost"} size="sm" onClick={() => handleStatusChange(status.key)} className="justify-start">
                <status.icon className="h-4 w-4 mr-2" />
                {status.label}
              </Button>
            ))}
            {currentStatus && (
              <><Separator className="my-1 bg-slate-700" /><Button variant="ghost" size="sm" onClick={() => handleStatusChange("remove")} className="justify-start text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
                <Trash2 className="h-4 w-4 mr-2" />Удалить из списка
              </Button></>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // --- [ИЗМЕНЕНИЕ] Логика для иконки на карточке (теперь с разными иконками) ---
  return (
    <Button 
        variant="secondary" 
        size="icon" 
        className={cn("absolute top-2 right-2 z-10 h-8 w-8 bg-black/50 text-white hover:bg-black/70", className)} 
        disabled={loading}
        title={statusInfo?.label || 'Добавить в список'}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info("Используйте ховер-меню для смены статуса"); }} // Иконка теперь просто индикатор
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CurrentIcon className="w-4 h-4" />}
    </Button>
  );
}
