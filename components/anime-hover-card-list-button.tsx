// components/anime-hover-card-list-button.tsx

"use client";

import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Eye, CalendarCheck, Clock } from "lucide-react";

const statuses = [
    { key: "watching", label: "Смотрю", icon: Eye },
    { key: "planned", label: "В планах", icon: Clock },
    { key: "completed", label: "Просмотрено", icon: CalendarCheck },
];

interface Props {
  animeId: number;
  initialStatus?: string | null;
}

export function AnimeHoverCardListButton({ animeId, initialStatus }: Props) {
  const { currentStatus, loading, handleStatusChange } = useAnimeListStatus(animeId, initialStatus);

  return (
    <div className="grid grid-cols-3 gap-1 pt-2">
      {statuses.map(status => (
        <Button
          key={status.key}
          variant={currentStatus === status.key ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleStatusChange(status.key)}
          disabled={loading}
          className="flex-col h-auto py-2"
        >
          <status.icon className="h-4 w-4" />
          <span className="text-xs mt-1">{status.label}</span>
        </Button>
      ))}
    </div>
  );
}
