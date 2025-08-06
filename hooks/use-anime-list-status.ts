// hooks/use-anime-list-status.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";
import type { Database } from '@/lib/types';

type ListStatus = 'watching' | 'completed' | 'planned' | 'dropped' | 'revisiting' | null;

export function useAnimeListStatus(animeId: number, userId: string | undefined) {
  const supabase = createClientComponentClient<Database>();
  const [status, setStatus] = useState<ListStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('user_anime_lists')
      .select('status')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching anime list status:', error);
      toast.error('Ошибка при загрузке статуса аниме.');
    } else if (data) {
      setStatus(data.status as ListStatus);
    } else {
      setStatus(null);
    }
    setLoading(false);
  }, [animeId, userId, supabase]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const updateStatus = useCallback(async (newStatus: ListStatus) => {
    if (!userId) {
      toast.error('Вы должны быть авторизованы для изменения статуса.');
      return;
    }
    setLoading(true);
    if (newStatus === null) {
      // Remove from list
      const { error } = await supabase
        .from('user_anime_lists')
        .delete()
        .eq('user_id', userId)
        .eq('anime_id', animeId);

      if (error) {
        console.error('Error removing from list:', error);
        toast.error('Ошибка при удалении из списка.');
      } else {
        setStatus(null);
        toast.success('Аниме удалено из списка.');
      }
    } else {
      // Add or update
      const { error } = await supabase
        .from('user_anime_lists')
        .upsert({ user_id: userId, anime_id: animeId, status: newStatus }, { onConflict: 'user_id,anime_id' });

      if (error) {
        console.error('Error updating list status:', error);
        toast.error('Ошибка при обновлении статуса аниме.');
      } else {
        setStatus(newStatus);
        toast.success(`Статус аниме обновлен на "${newStatus}"`);
      }
    }
    setLoading(false);
  }, [animeId, userId, supabase]);

  return { status, loading, updateStatus };
}
