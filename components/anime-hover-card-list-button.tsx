// components/anime-hover-card-list-button.tsx

"use client";

import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, CalendarCheck, Clock, Plus } from "lucide-react";
import Link from "next/link";

const statuses = [
    { key: "watching", label: "Смотрю", icon: Eye },
    { key: "planned", label: "В планах", icon: Clock },
    { key: "completed", label: "Просмотрено", icon: CalendarCheck },
];

interface Props {
  animeId: number;
  initialStatus?: string | null;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
}

export function AnimeHoverCardListButton({ animeId, initialStatus, onStatusChange }: Props) {
  const { session, currentStatus, loading, handleStatusChange } = useAnimeListStatus(animeId, initialStatus, onStatusChange);
  
  if (!session) {
    return (
      <Link href="/login" className="w-full pt-2">
        <Button variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Добавить в список</Button>
      </Link>
    );
  }
  
  return (
    <div className="pt-2">
      {loading && <div className="h-16 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
      {!loading && (
        <div className="grid grid-cols-3 gap-1">
        {statuses.map(status => (
          <Button
            key={status.key}
            variant={currentStatus === status.key ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleStatusChange(status.key)}
            className="flex-col h-auto py-2"
            title={status.label}
          >
            <status.icon className="h-4 w-4" />
            <span className="text-xs mt-1">{status.label}</span>
          </Button>
        ))}
        </div>
      )}
    </div>
  );
}
