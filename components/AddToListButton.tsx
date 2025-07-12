// /components/AddToListButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, Check, Plus, Bookmark, Trash2 } from "lucide-react";
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';
import Link from 'next/link';

const statuses = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "В планах" },
  { key: "completed", label: "Просмотрено" },
  { key: "rewatching", label: "Пересматриваю" },
  { key: "on_hold", label: "Отложено" },
  { key: "dropped", label: "Брошено" },
];

interface AddToListButtonProps {
  animeId: number;
  initialStatus?: string | null;
  variant?: 'full' | 'icon';
}

export function AddToListButton({ animeId, initialStatus, variant = 'full' }: AddToListButtonProps) {
  const { session } = useSupabase();
  const [currentStatus, setCurrentStatus] = useState(initialStatus || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Этот эффект будет обновлять статус, если initialStatus изменится
    setCurrentStatus(initialStatus || null);
  }, [initialStatus]);

  const handleStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Нужно войти в аккаунт, чтобы добавлять в списки.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: animeId, status: newStatus }),
      });
      if (!response.ok) throw new Error("Ошибка обновления статуса");
      
      setCurrentStatus(newStatus === 'remove' ? null : newStatus);
      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    if (variant === 'icon') return null; // Не показываем иконку гостям
    return (
        <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Добавить в список
            </Button>
        </Link>
    );
  }
  
  const currentStatusLabel = statuses.find(s => s.key === currentStatus)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'full' ? (
          <Button variant="outline" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
             currentStatus ? (<><Check className="w-4 h-4 mr-2 text-green-500" />{currentStatusLabel}</>) : 
             (<><Plus className="w-4 h-4 mr-2" />Добавить в список</>)}
          </Button>
        ) : (
          <Button variant="secondary" size="icon" className="h-8 w-8" disabled={loading} onClick={(e) => e.stopPropagation()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             currentStatus ? <Check className="w-4 h-4 text-green-500" /> : 
             <Plus className="w-4 h-4" />}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-slate-800 border-slate-700 text-white">
        {statuses.map((status) => (
          <DropdownMenuItem key={status.key} onSelect={(e) => handleStatusChange(e, status.key)} className="cursor-pointer hover:bg-slate-700">
            <Bookmark className="w-4 h-4 mr-2" /><span>{status.label}</span>
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10 cursor-pointer" onSelect={(e) => handleStatusChange(e, "remove")}>
              <Trash2 className="w-4 h-4 mr-2" /><span>Удалить из списка</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
