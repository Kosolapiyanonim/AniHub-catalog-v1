// components/anime-page-list-button.tsx

"use client";

import { useState } from "react";
import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Bookmark, Trash2, Eye, CalendarCheck, XCircle, History, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const statuses = [
    { key: "watching", label: "Смотрю", icon: Eye },
    { key: "planned", label: "В планах", icon: Clock },
    { key: "completed", label: "Просмотрено", icon: CalendarCheck },
    { key: "rewatching", label: "Пересматриваю", icon: History },
    { key: "on_hold", label: "Отложено", icon: Bookmark },
    { key: "dropped", label: "Брошено", icon: XCircle },
];
const statusMap = new Map(statuses.map(s => [s.key, { label: s.label, icon: s.icon }]));

interface Props {
  animeId: number;
  initialStatus?: string | null;
  onStatusChange?: (newStatus: string | null) => void;
}

export function AnimePageListButton({ animeId, initialStatus, onStatusChange }: Props) {
  const { session, currentStatus, loading, handleStatusChange } = useAnimeListStatus(animeId, initialStatus, onStatusChange);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  if (!session) {
    return (
      <Link href="/login" className="w-full">
        <Button variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Добавить в список</Button>
      </Link>
    );
  }

  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CurrentIcon className="mr-2 h-4 w-4" />}
          {statusInfo ? statusInfo.label : 'Добавить в список'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 bg-slate-800 border-slate-700 text-white">
        <div className="grid grid-cols-1 gap-1">
          {statuses.map((status) => (
            <Button
              key={status.key}
              variant={currentStatus === status.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                  handleStatusChange(status.key);
                  setPopoverOpen(false);
              }}
              className="justify-start"
            >
              <status.icon className="mr-2 h-4 w-4" />{status.label}
            </Button>
          ))}
          {currentStatus && (
            <>
              <Separator className="my-1 bg-slate-700" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    handleStatusChange("remove");
                    setPopoverOpen(false);
                }}
                className="justify-start text-red-500 hover:!text-red-500 hover:!bg-red-500/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />Удалить из списка
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
