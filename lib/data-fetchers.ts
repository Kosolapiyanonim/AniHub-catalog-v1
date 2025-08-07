import { supabase } from './supabase';
import { Anime, Profile, UserAnimeList } from './types';

// Existing data fetchers (assuming they are here)
export async function getAnimeList(limit: number = 20, offset: number = 0): Promise<Anime[]> {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching anime list:', error);
    return [];
  }
  return data || [];
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching anime by ID:', error);
    return null;
  }
  return data;
}

// New data fetchers for User Profile
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function getUserAnimeLists(userId: string, status?: AnimeListStatus): Promise<UserAnimeList[]> {
  let query = supabase
    .from('user_anime_lists')
    .select(`
      *,
      anime:animes(*)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user anime lists:', error);
    return [];
  }
  return data || [];
}

export async function updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}
