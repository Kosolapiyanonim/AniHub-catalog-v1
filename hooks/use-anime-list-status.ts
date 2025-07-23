// hooks/use-anime-list-status.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { toast } from "sonner";

// --- ИЗМЕНЕНИЕ: Хук теперь принимает необязательную функцию onStatusChange ---
export function useAnimeListStatus(
  animeId: number, 
  initialStatus?: string | null,
  onStatusChange?: (newStatus: string | null) => void
) {
  const { session } = useSupabase();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!session) {
      toast.error("Для этого действия необходимо войти в аккаунт");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: animeId, status: newStatus }),
      });
      if (!response.ok) throw new Error("Ошибка сервера");
      
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      
      // --- ИЗМЕНЕНИЕ: Вызываем колбэк, если он был передан ---
      if (onStatusChange) {
        onStatusChange(newResolvedStatus);
      }

      toast.success("Статус обновлен!");
    } catch (error) {
      toast.error("Не удалось обновить статус.");
    } finally {
      setLoading(false);
    }
  }, [animeId, session, onStatusChange]);

  return { session, currentStatus, loading, handleStatusChange };
}
