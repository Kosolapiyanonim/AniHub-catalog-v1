// components/anime-card-list-button.tsx

"use client";

import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check, Trash2, Eye, CalendarCheck, Clock, History, Bookmark, XCircle } from "lucide-react";

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
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
}

export function AnimeCardListButton({ animeId, initialStatus, onStatusChange }: Props) {
  const { session, currentStatus, loading, handleStatusChange } = useAnimeListStatus(animeId, initialStatus, onStatusChange);

  if (!session) return null;

  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-2 right-2 z-20 h-8 w-8 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          title={statusInfo?.label || 'Добавить в список'}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CurrentIcon className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => { e.preventDefault(); e.stopPropagation();}} className="bg-slate-800 border-slate-700 text-white">
          {statuses.map((status) => (
            <DropdownMenuItem key={status.key} onSelect={() => handleStatusChange(status.key)} className="cursor-pointer hover:bg-slate-700">
                <status.icon className="mr-2 h-4 w-4" />
                <span>{status.label}</span>
                {currentStatus === status.key && <Check className="ml-auto h-4 w-4 text-green-500" />}
            </DropdownMenuItem>
          ))}
          {currentStatus && (
              <><DropdownMenuSeparator className="bg-slate-700" /><DropdownMenuItem className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10 cursor-pointer" onSelect={() => handleStatusChange("remove")}><Trash2 className="mr-2 h-4 w-4" /><span>Удалить из списка</span></DropdownMenuItem></>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
