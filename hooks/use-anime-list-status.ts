import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { type Anime, type UserAnimeList } from '@/lib/types';

export function useAnimeListStatus(animeId: string) {
  const { supabase, session } = useSupabase();
  const [userListItem, setUserListItem] = useState<UserAnimeList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserListItem = async () => {
      if (!session?.user) {
        setUserListItem(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_anime_lists')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('anime_id', animeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching user list item:', error.message);
      } else if (data) {
        setUserListItem(data);
      } else {
        setUserListItem(null);
      }
      setIsLoading(false);
    };

    fetchUserListItem();
  }, [animeId, session, supabase]);

  const updateStatus = async (status: UserAnimeList['status'], score?: number, episodesWatched?: number) => {
    if (!session?.user) {
      console.error('User not authenticated.');
      return;
    }

    setIsLoading(true);
    const now = new Date().toISOString();

    const itemData = {
      user_id: session.user.id,
      anime_id: animeId,
      status,
      score: score || null,
      episodes_watched: episodesWatched || 0,
      updated_at: now,
    };

    let error = null;
    if (userListItem) {
      const { error: updateError, data } = await supabase
        .from('user_anime_lists')
        .update(itemData)
        .eq('id', userListItem.id)
        .select()
        .single();
      error = updateError;
      if (data) setUserListItem(data);
    } else {
      const { error: insertError, data } = await supabase
        .from('user_anime_lists')
        .insert({ ...itemData, created_at: now })
        .select()
        .single();
      error = insertError;
      if (data) setUserListItem(data);
    }

    setIsLoading(false);
    if (error) {
      console.error('Error updating anime list status:', error.message);
      return false;
    }
    return true;
  };

  const deleteFromList = async () => {
    if (!session?.user || !userListItem) {
      console.error('User not authenticated or item not in list.');
      return false;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('user_anime_lists')
      .delete()
      .eq('id', userListItem.id);

    setIsLoading(false);
    if (error) {
      console.error('Error deleting anime from list:', error.message);
      return false;
    }
    setUserListItem(null);
    return true;
  };

  return {
    userListItem,
    isLoading,
    updateStatus,
    deleteFromList,
  };
}
