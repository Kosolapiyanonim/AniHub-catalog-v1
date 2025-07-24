"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { useToast } from '@/hooks/use-toast';

export function useAnimeListStatus(
  animeId: number, 
  initialStatus?: string | null,
  onStatusChange?: (animeId: number, newStatus: string | null) => void
) {
  const { supabase, session } = useSupabase();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialStatus || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && animeId) {
      fetchCurrentStatus();
    }
  }, [session, animeId]);

  const fetchCurrentStatus = async () => {
    if (!session || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_anime_lists')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching anime status:', error);
        return;
      }

      setCurrentStatus(data?.status || null);
    } catch (error) {
      console.error('Error fetching anime status:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!session || !supabase) return;
    
    setLoading(true);

    try {
      if (newStatus === 'remove') {
        // Remove from list
        const { error } = await supabase
          .from('user_anime_lists')
          .delete()
          .eq('user_id', session.user.id)
          .eq('anime_id', animeId);

        if (error) throw error;

        setCurrentStatus(null);
        onStatusChange?.(animeId, null);
        
        toast({
          title: "Удалено из списка",
          description: "Аниме удалено из вашего списка",
        });
      } else {
        // Update or insert status
        const { error } = await supabase
          .from('user_anime_lists')
          .upsert({
            user_id: session.user.id,
            anime_id: animeId,
            status: newStatus,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        setCurrentStatus(newStatus);
        onStatusChange?.(animeId, newStatus);

        const statusLabels: Record<string, string> = {
          watching: 'Смотрю',
          planned: 'В планах',
          completed: 'Просмотрено',
          rewatching: 'Пересматриваю',
          on_hold: 'Отложено',
          dropped: 'Брошено'
        };

        toast({
          title: "Статус обновлен",
          description: `Статус изменен на "${statusLabels[newStatus]}"`,
        });
      }
    } catch (error) {
      console.error('Error updating anime status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус аниме",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    currentStatus,
    loading,
    handleStatusChange,
    fetchCurrentStatus
  };
}
