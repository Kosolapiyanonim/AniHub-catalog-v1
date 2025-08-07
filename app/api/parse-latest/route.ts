import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { searchKodikAnime } from '@/lib/anime-api';

export const maxDuration = 60; // 60 seconds

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Fetch recent updates from Kodik (e.g., by searching for a common term or using a specific Kodik endpoint if available)
    // For demonstration, we'll just search for "anime" and process the first few results.
    // In a real scenario, Kodik might have an "updates" or "latest" endpoint.
    const latestAnime = await searchKodikAnime("anime"); // This will get recent additions/updates

    let processedCount = 0;
    for (const kodikAnime of latestAnime) {
      const { material_data, translations } = kodikAnime;

      if (!material_data || !material_data.shikimori_id) {
        console.warn(`Skipping anime ${kodikAnime.title} due to missing material_data or shikimori_id.`);
        continue;
      }

      // Insert/Update Anime
      const { data: existingAnime, error: fetchError } = await supabase
        .from('animes')
        .select('id')
        .eq('shikimori_id', material_data.shikimori_id)
        .single();

      let animeId: string;
      if (existingAnime) {
        const { error: updateError } = await supabase
          .from('animes')
          .update({
            title: kodikAnime.title,
            title_orig: kodikAnime.title_orig,
            poster_url: material_data.poster_url,
            description: material_data.description,
            year: material_data.year,
            shikimori_rating: material_data.anime_shikimori_rating,
            episodes_total: material_data.anime_episodes_total,
            episodes_aired: material_data.anime_episodes_aired,
            status: material_data.anime_status,
            kind: material_data.anime_kind,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAnime.id);
        if (updateError) throw updateError;
        animeId = existingAnime.id;
      } else {
        const { data: newAnime, error: insertError } = await supabase
          .from('animes')
          .insert({
            shikimori_id: material_data.shikimori_id,
            title: kodikAnime.title,
            title_orig: kodikAnime.title_orig,
            poster_url: material_data.poster_url,
            description: material_data.description,
            year: material_data.year,
            shikimori_rating: material_data.anime_shikimori_rating,
            episodes_total: material_data.anime_episodes_total,
            episodes_aired: material_data.anime_episodes_aired,
            status: material_data.anime_status,
            kind: material_data.anime_kind,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (insertError) throw insertError;
        animeId = newAnime.id;
      }

      // Process Genres
      if (material_data.anime_genres && material_data.anime_genres.length > 0) {
        for (const genreName of material_data.anime_genres) {
          const { data: genreData, error: genreError } = await supabase
            .from('genres')
            .upsert({ name: genreName }, { onConflict: 'name' })
            .select('id')
            .single();
          if (genreError) throw genreError;

          if (genreData) {
            const { error: linkError } = await supabase
              .from('anime_genres')
              .upsert({ anime_id: animeId, genre_id: genreData.id }, { onConflict: 'anime_id,genre_id' });
            if (linkError) throw linkError;
          }
        }
      }

      // Process Studios
      if (material_data.anime_studios && material_data.anime_studios.length > 0) {
        for (const studioName of material_data.anime_studios) {
          const { data: studioData, error: studioError } = await supabase
            .from('studios')
            .upsert({ name: studioName }, { onConflict: 'name' })
            .select('id')
            .single();
          if (studioError) throw studioError;

          if (studioData) {
            const { error: linkError } = await supabase
              .from('anime_studios')
              .upsert({ anime_id: animeId, studio_id: studioData.id }, { onConflict: 'anime_id,studio_id' });
            if (linkError) throw linkError;
          }
        }
      }

      // Process Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          const { error: translationError } = await supabase
            .from('translations')
            .upsert({
              kodik_id: translation.id,
              anime_id: animeId,
              title: translation.title,
              type: translation.type,
              quality: translation.quality,
              link_id: translation.link_id,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'kodik_id' });
          if (translationError) throw translationError;
        }
      }
      processedCount++;
    }

    return NextResponse.json({ message: `Latest parse completed. Processed ${processedCount} anime.` });
  } catch (error: any) {
    console.error('Latest parse failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
