"use client";

import { useState, useEffect } from "react";
import { useSupabase } from './supabase-provider';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Loader2, Check, Plus, Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const statuses = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "В планах" },
  { key: "completed", label: "Просмотрено" },
];

interface AddToListButtonProps {
  animeId: number;
  initialStatus?: string | null;
}

export function AddToListButton({ animeId, initialStatus }: AddToListButtonProps) {
  const { session } = useSupabase();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    if (!session) return toast.error("Нужно войти в аккаунт");
    
    setLoading(true);
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anime_id: animeId, status: newStatus }),
    });
    setCurrentStatus(newStatus === 'remove' ? null : newStatus);
    setLoading(false);
    toast.success("Статус обновлен");
  };

  if (!session) {
    return <Link href="/login" className="w-full"><Button variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" /> Добавить в список</Button></Link>;
  }
  
  const currentStatusLabel = statuses.find(s => s.key === currentStatus)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full" disabled={loading} onClick={(e) => e.stopPropagation()}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
           currentStatus ? (<><Check className="w-4 h-4 mr-2 text-green-500" />{currentStatusLabel}</>) : 
           (<><Plus className="w-4 h-4 mr-2" />Добавить в список</>)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-slate-800 border-slate-700 text-white">
        {statuses.map((status) => (
          <DropdownMenuItem key={status.key} onSelect={(e) => handleStatusChange(e, status.key)} className="cursor-pointer">
            <Bookmark className="w-4 h-4 mr-2" /><span>{status.label}</span>
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <><DropdownMenuSeparator /><DropdownMenuItem className="text-red-500" onSelect={(e) => handleStatusChange(e, "remove")}><Trash2 className="w-4 h-4 mr-2" /><span>Удалить из списка</span></DropdownMenuItem></>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
