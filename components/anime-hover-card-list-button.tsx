"use client";

import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check, Trash2, Eye, CalendarCheck, Clock, History, Bookmark, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const statuses = [
  { key: "watching", label: "Смотрю", icon: Eye, color: "text-green-500" },
  { key: "planned", label: "В планах", icon: Clock, color: "text-blue-500" },
  { key: "completed", label: "Просмотрено", icon: CalendarCheck, color: "text-purple-500" },
  { key: "rewatching", label: "Пересматриваю", icon: History, color: "text-orange-500" },
  { key: "on_hold", label: "Отложено", icon: Bookmark, color: "text-yellow-500" },
  { key: "dropped", label: "Брошено", icon: XCircle, color: "text-red-500" },
];

const statusMap = new Map(statuses.map(s => [s.key, s]));

interface AnimeHoverCardListButtonProps {
  animeId: number;
  initialStatus?: string | null;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AnimeHoverCardListButton({ 
  animeId, 
  initialStatus, 
  onStatusChange,
  variant = "outline",
  size = "sm",
  className
}: AnimeHoverCardListButtonProps) {
  const { session, currentStatus, loading, handleStatusChange } = useAnimeListStatus(animeId, initialStatus, onStatusChange);

  if (!session) return null;

  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={cn(
            "gap-2",
            statusInfo && statusInfo.color,
            className
          )}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CurrentIcon className="h-4 w-4" />
          )}
          {statusInfo ? statusInfo.label : 'Добавить в список'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {statuses.map((status) => (
          <DropdownMenuItem 
            key={status.key} 
            onSelect={() => handleStatusChange(status.key)}
            className="cursor-pointer"
          >
            <status.icon className={cn("mr-2 h-4 w-4", status.color)} />
            <span>{status.label}</span>
            {currentStatus === status.key && (
              <Check className="ml-auto h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 hover:!text-red-500 hover:!bg-red-500/10 cursor-pointer" 
              onSelect={() => handleStatusChange("remove")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Удалить из списка</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
