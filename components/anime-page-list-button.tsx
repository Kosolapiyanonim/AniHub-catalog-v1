// components/anime-page-list-button.tsx

"use client";

import { useAnimeListStatus } from "@/hooks/use-anime-list-status";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Bookmark, Trash2, Eye, CalendarCheck, XCircle, History, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLoginUrl, getRegisterUrl } from "@/lib/auth-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";

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
  const pathname = usePathname();
  
  // Если пользователь не авторизован, показываем специальный блок
  if (!session) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-center p-4 space-y-2">
        <p className="text-sm text-gray-300">Войдите, чтобы добавить в список</p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1"><Link href={getLoginUrl(pathname)}>Войти</Link></Button>
          <Button asChild size="sm" variant="secondary" className="flex-1"><Link href={getRegisterUrl(pathname)}>Регистрация</Link></Button>
        </div>
      </Card>
    );
  }

  const statusInfo = currentStatus ? statusMap.get(currentStatus) : null;
  const CurrentIcon = statusInfo ? statusInfo.icon : Plus;

  return (
    <Collapsible className="w-full space-y-1">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between" disabled={loading}>
          <span className="flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CurrentIcon className="h-4 w-4" />}
            {statusInfo ? statusInfo.label : 'Добавить в список'}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
        {statuses.map((status) => (
          <Button
            key={status.key}
            variant={currentStatus === status.key ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleStatusChange(status.key)}
            className="w-full justify-start"
          >
            <status.icon className="mr-2 h-4 w-4" />{status.label}
          </Button>
        ))}
        {currentStatus && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange("remove")}
            className="w-full justify-start text-red-500 hover:!text-red-500 hover:!bg-red-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />Удалить из списка
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
