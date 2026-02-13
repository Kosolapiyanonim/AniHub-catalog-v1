import { createClient } from "@supabase/supabase-js";

export interface AnimeSeoData {
  shikimori_id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
}

function getSupabasePublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function getAnimeSeoData(shikimoriId: string): Promise<AnimeSeoData | null> {
  if (!shikimoriId) return null;

  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("animes")
      .select("shikimori_id, title, description, poster_url")
      .eq("shikimori_id", shikimoriId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getAnimeSitemapIds(): Promise<string[]> {
  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("animes")
      .select("shikimori_id")
      .order("id", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data
      .map((anime) => anime.shikimori_id)
      .filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
}
