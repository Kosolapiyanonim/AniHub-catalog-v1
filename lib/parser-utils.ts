// /lib/parser-utils.ts
import type { KodikAnimeData } from "@/lib/types"
import { normalizeShikimoriImageUrl } from "@/lib/normalizeShikimoriImageUrl"

// Трансформирует данные из Kodik в формат таблицы 'animes'
export function transformToAnimeRecord(anime: KodikAnimeData) {
  const material = anime.material_data || {}

  const poster = material.anime_poster_url || material.poster_url || null
  // Нормализуем poster_url: если normalize вернул null, но исходное значение было, оставляем исходное
  // Это безопасно, так как если normalize не смог обработать URL, лучше сохранить исходный
  const normalizedPoster = normalizeShikimoriImageUrl(poster) ?? poster ?? null
  return {
    shikimori_id: anime.shikimori_id,
    kinopoisk_id: anime.kinopoisk_id || null,
    title: material.anime_title || anime.title,
    title_orig: anime.title_orig || null,
    year: anime.year || null,
    poster_url: normalizedPoster,
    description: material.anime_description || material.description || "Описание отсутствует.",
    type: anime.type,
    anime_kind: material.anime_kind || null,
    status: material.anime_status || null,
    episodes_count: anime.episodes_count || 0,
    episodes_total: material.episodes_total || anime.episodes_count || 0,
    episodes_aired: anime.last_episode || 0,
    rating_mpaa: material.rating_mpaa || null,
    kinopoisk_rating: material.kinopoisk_rating || null,
    imdb_rating: material.imdb_rating || null,
    shikimori_rating: material.shikimori_rating || null,
    kinopoisk_votes: material.kinopoisk_votes || null,
    shikimori_votes: material.shikimori_votes || null,
    screenshots: anime.screenshots || [],
    updated_at_kodik: anime.updated_at || null,
  }
}

// Обрабатывает все связи для одного аниме
export async function processAllRelationsForAnime(supabase: any, anime: KodikAnimeData, animeId: number) {
  const material = anime.material_data || {}
  await Promise.all([
    processRelation(supabase, "genre", "genres", animeId, material.anime_genres || []),
    processRelation(supabase, "studio", "studios", animeId, material.anime_studios || []),
    processRelation(supabase, "country", "countries", animeId, material.countries || []),
  ])
}

// Внутренняя функция для обработки одного типа связей
async function processRelation(
  supabase: any,
  entityName: string,
  entityPluralName: string,
  animeId: number,
  entityValues: string[],
) {
  if (!entityValues || entityValues.length === 0) return

  const validValues = entityValues.filter((name) => name && name.trim() !== "")
  if (validValues.length === 0) return

  const { data: existingEntities } = await supabase.from(entityPluralName).select("id, name").in("name", validValues)
  const existingMap = new Map((existingEntities || []).map((e: any) => [e.name, e.id]))

  const newEntitiesToCreate = validValues
    .filter((name) => !existingMap.has(name))
    .map((name) => ({
      name,
      slug:
        name
          .toLowerCase()
          .replace(/[^a-z0-9а-яё]+/gi, "-")
          .replace(/^-+|-+$/g, "") || name,
    }))

  if (newEntitiesToCreate.length > 0) {
    const { data } = await supabase.from(entityPluralName).insert(newEntitiesToCreate).select("id, name")
    if (data) {
      data.forEach((e: any) => existingMap.set(e.name, e.id))
    }
  }

  const relationRecords = validValues
    .map((name) => {
      const entityId = existingMap.get(name)
      if (!entityId) return null
      return {
        anime_id: animeId,
        [`${entityName}_id`]: entityId,
      }
    })
    .filter(Boolean)

  if (relationRecords.length > 0) {
    await supabase.from(`anime_${entityPluralName}`).upsert(relationRecords)
  }
}
