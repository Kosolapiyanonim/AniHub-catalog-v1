// components/AddToListButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useSupabase } from './supabase-provider';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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

  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return toast.error("Нужно войти в аккаунт");
    setLoading(true);
    try {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Этот блок кода отвечает за то, КАК выглядит кнопка */}
        {variant === 'full' ? (
          // Большая кнопка для страницы аниме
          <Button variant="outline" className={cn("w-full", className)} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
             <><CurrentIcon className="w-4 h-4 mr-2" />{statusInfo ? statusInfo.label : 'Добавить в список'}</>}
          </Button>
        ) : (
          // Иконка для карточки аниме
          <Button 
              variant="secondary" 
              size="icon" 
              className={cn("absolute top-2 right-2 z-10 h-8 w-8 bg-black/50 text-white hover:bg-black/70", className)} 
              disabled={loading}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              title={statusInfo?.label || 'Добавить в список'}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CurrentIcon className="w-4 h-4" />}
          </Button>
        )}
      </DropdownMenuTrigger>
      
      {/* Этот блок кода отвечает за ВСПЛЫВАЮЩЕЕ МЕНЮ. Он одинаков для обоих вариантов кнопки. */}
      <DropdownMenuContent onClick={(e) => { e.preventDefault(); e.stopPropagation();}} className="bg-slate-800 border-slate-700 text-white">
        {statuses.map((status) => (
          <DropdownMenuItem key={status.key} onSelect={() => handleStatusChange(status.key)} className="cursor-pointer hover:bg-slate-700">
            <status.icon className="h-4 w-4 mr-2" />
            <span>{status.label}</span>
            {currentStatus === status.key && <Check className="h-4 w-4 ml-auto text-green-500" />}
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <><DropdownMenuSeparator className="bg-slate-700" /><DropdownMenuItem className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10 cursor-pointer" onSelect={() => handleStatusChange("remove")}><Trash2 className="w-4 h-4 mr-2" /><span>Удалить из списка</span></DropdownMenuItem></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
