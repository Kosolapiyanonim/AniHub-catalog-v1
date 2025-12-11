// app/api/anime/[id]/route.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {}
      },
    },
  })
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const shikimoriId = params.id
  if (!shikimoriId) {
    return NextResponse.json({ error: "Shikimori ID is required" }, { status: 400 })
  }

  const supabase = createSupabaseClient()

  try {
    // --- ШАГ 1: Получаем сессию пользователя ---
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // --- ШАГ 2: Получаем основную информацию об аниме ---
    const { data: anime, error: animeError } = await supabase
      .from("animes")
      .select(`
        *, 
        genres:anime_genres(genres(id, name, slug)), 
        studios:anime_studios(studios(id, name, slug)),
        tags:anime_tags(tags(id, name, slug))
      `)
      .eq("shikimori_id", shikimoriId)
      .single()

    if (animeError) {
      if (animeError.code === "PGRST116") {
        return NextResponse.json({ error: "Аниме не найдено" }, { status: 404 })
      }
      throw animeError
    }

    // --- ШАГ 3: Получаем статус аниме в списке пользователя (если он авторизован) ---
    let userListStatus: string | null = null
    if (session) {
      const { data: listData } = await supabase
        .from("user_lists")
        .select("status")
        .eq("user_id", session.user.id)
        .eq("anime_id", anime.id)
        .single()

      if (listData) {
        userListStatus = listData.status
      }
    }

    // --- ШАГ 4: Получаем озвучки и связанные произведения параллельно ---
    const [translationsResponse, relatedResponse] = await Promise.all([
      supabase.from("translations").select("*").eq("anime_id", anime.id),
      supabase.from("anime_relations").select("relation_type_formatted, related_id").eq("anime_id", anime.id),
    ])

    const translations = translationsResponse.data || []
    const relations = relatedResponse.data || []

    // --- ШАГ 5: Получаем информацию о связанных аниме (если они есть) ---
    let relatedAnimesWithInfo = []
    if (relations.length > 0) {
      const relatedAnimeIds = relations.map((r) => r.related_id)

      const { data: relatedInfo } = await supabase
        .from("animes")
        .select("id, shikimori_id, title, poster_url, year, type")
        .in("id", relatedAnimeIds)

      relatedAnimesWithInfo = relations
        .map((relation) => {
          const animeInfo = relatedInfo?.find((a) => a.id === relation.related_id)
          if (!animeInfo) return null
          return {
            ...animeInfo,
            relation_type_formatted: relation.relation_type_formatted,
          }
        })
        .filter(Boolean)
    }

    // --- ШАГ 6: Собираем финальный ответ, добавляя статус пользователя ---
    const responseData = {
      ...anime,
      genres: (anime.genres || []).map((g: any) => g.genres).filter(Boolean),
      studios: (anime.studios || []).map((s: any) => s.studios).filter(Boolean),
      tags: (anime.tags || []).map((t: any) => t.tags).filter(Boolean),
      translations: translations,
      related: relatedAnimesWithInfo,
      user_list_status: userListStatus, // <-- Вот добавленная информация
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error)
    const message = error instanceof Error ? error.message : "Неизвестная ошибка"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
