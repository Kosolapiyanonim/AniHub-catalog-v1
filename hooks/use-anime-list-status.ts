// hooks/use-anime-list-status.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { toast } from "sonner";


export function useAnimeListStatus(
  animeId: number, 
  initialStatus?: string | null,
  onStatusChange?: (animeId: number, newStatus: string | null) => void
) {
  const { session, refreshSession } = useSupabase();
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
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Ошибка сервера" }));
        
        // Handle 401 Unauthorized - session expired
        if (response.status === 401) {
          // Try to refresh client session first
          await refreshSession();
          toast.error("Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.");
          // Refresh the page to trigger middleware token refresh
          window.location.reload();
          return;
        }
        
        throw new Error(errorData.error || "Ошибка сервера");
      }
      
      // After successful API call, refresh client session to sync with server
      // This ensures client sees updated session if token was refreshed on server
      await refreshSession();
      
      const newResolvedStatus = newStatus === 'remove' ? null : newStatus;
      setCurrentStatus(newResolvedStatus);
      
      if (onStatusChange) {
        onStatusChange(animeId, newResolvedStatus);
      }

      toast.success("Статус обновлен!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось обновить статус.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [animeId, session, onStatusChange, refreshSession]);

  return { session, currentStatus, loading, handleStatusChange };
}
