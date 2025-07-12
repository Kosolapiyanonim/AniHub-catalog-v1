// /components/AddToListButton.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, Check, Plus, Bookmark } from "lucide-react";

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
}

export function AddToListButton({ animeId }: AddToListButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setLoading(true);
        const response = await fetch(`/api/lists?anime_id=${animeId}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(data?.status || null);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [animeId, supabase.auth]);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anime_id: animeId, status: newStatus }),
    });
    setCurrentStatus(newStatus === 'remove' ? null : newStatus);
    setLoading(false);
  };

  if (!user) {
    return <Button disabled>Добавить в список</Button>;
  }

  const currentStatusLabel = statuses.find(s => s.key === currentStatus)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : currentStatus ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              {currentStatusLabel}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Добавить в список
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.key}
            onSelect={() => handleStatusChange(status.key)}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            {status.label}
          </DropdownMenuItem>
        ))}
        {currentStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onSelect={() => handleStatusChange("remove")}
            >
              Удалить из списка
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
