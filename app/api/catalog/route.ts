import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import createClientAuth from "@/lib/supabase/server"

const parseIds = (param: string | null): number[] | null => {
  if (!param) return null
  const ids = param
    .split(",")
    .map((item) => Number.parseInt(item.split("-")[0], 10))
    .filter((id) => !isNaN(id))
  return ids.length > 0 ? ids : null
}

export const dynamic = "force-dynamic"


const SEARCH_STOP_WORDS = new Set(["аниме", "anime"])

const buildTitleSearchClauses = (rawTitle: string): string[] => {
  const normalized = rawTitle.trim().toLowerCase()
  if (!normalized) return []

  const clauses = new Set<string>()
  clauses.add(`title.ilike.%${normalized}%,title_orig.ilike.%${normalized}%`)

  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token))

  if (tokens.length > 0) {
    clauses.add(tokens.map((token) => `title.ilike.%${token}%`).join(","))
    clauses.add(tokens.map((token) => `title_orig.ilike.%${token}%`).join(","))
  }

  return Array.from(clauses)
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Создаем публичный клиент для основных запросов (не зависит от JWT в cookies)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 })
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Создаем auth client только для проверки пользователя (опционально)
  let user = null
  try {
    const authClient = await createClientAuth()
    const { data: { user: authUser }, error: userError } = await authClient.auth.getUser()
    
    if (userError && userError.message?.includes('JWT')) {
      // JWT expired - игнорируем, работаем без пользователя
      console.log("JWT expired, continuing without user")
    } else if (userError) {
      console.log("Auth check failed, continuing without user:", userError)
    } else {
      user = authUser
    }
  } catch (authError: any) {
    // Игнорируем ошибки авторизации - работаем без пользователя
    console.log("Auth check failed, continuing without user:", authError)
  }

  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const limit = Number.parseInt(searchParams.get("limit") || "25", 10)
  const offset = (page - 1) * limit
  const sort = searchParams.get("sort") || "shikimori_votes"
  const order = searchParams.get("order") || "desc"

  try {

    // --- [НОВЫЙ БЛОК] СНАЧАЛА ПОЛУЧАЕМ ID ИЗ СПИСКА ПОЛЬЗОВАТЕЛЯ, ЕСЛИ ФИЛЬТР АКТИВЕН ---
    const user_list_status = searchParams.get("user_list_status")
    let userListIds: number[] | null = null

    if (user_list_status && user) {
      try {
        const authClient = await createClientAuth()
        const { data: animeIdsInList, error: listError } = await authClient
          .from("user_lists")
          .select("anime_id")
          .eq("user_id", user.id)
          .eq("status", user_list_status)

        if (listError) throw listError

        if (!animeIdsInList || animeIdsInList.length === 0) {
          // Если в списке пользователя по этому статусу ничего нет, возвращаем пустой результат
          return NextResponse.json({ results: [], total: 0, hasMore: false })
        }
        // Сохраняем ID аниме из списка пользователя
        userListIds = animeIdsInList.map((item) => item.anime_id)
      } catch (listError) {
        // Если не удалось получить списки пользователя, игнорируем фильтр
        console.log("Failed to fetch user list for filter:", listError)
      }
    }
    // --- КОНЕЦ НОВОГО БЛОКА ---

    // Начинаем строить основной запрос
    let query = supabase
      .from("animes_with_details")
      .select(
        "*, episodes_aired, episodes_total, anime_kind, genres:anime_genres(genres(id, name, slug)), studios:anime_studios(studios(id, name, slug))",
        { count: "exact" },
      )
      .not("shikimori_id", "is", null)
      .not("poster_url", "is", null)

    // --- [ИЗМЕНЕНИЕ] СРАЗУ ПРИМЕНЯЕМ ФИЛЬТР ПО ID ИЗ СПИСКА ПОЛЬЗОВАТЕЛЯ, ЕСЛИ ОН ЕСТЬ ---
    if (userListIds) {
      query = query.in("id", userListIds)
    }

    // --- ПРИМЕНЯЕМ ВСЕ ФИЛЬТРЫ ---
    const title = searchParams.get("title")
    if (title) {
      const searchClauses = buildTitleSearchClauses(title)
      if (searchClauses.length > 0) {
        query = query.or(searchClauses.join(","))
      }
    }

    // ИЗМЕНЕНИЕ: Фильтруем по anime_kind
    const kinds = searchParams.get("kinds")?.split(",")
    if (kinds && kinds.length > 0) query = query.in("anime_kind", kinds)

    const statuses = searchParams.get("statuses")?.split(",")
    if (statuses && statuses.length > 0) query = query.in("status", statuses)

    const year_from = searchParams.get("year_from")
    if (year_from) query = query.gte("year", Number.parseInt(year_from))

    const year_to = searchParams.get("year_to")
    if (year_to) query = query.lte("year", Number.parseInt(year_to))

    const isAsc = order === "asc"
    query = query.order(sort, { ascending: isAsc, nullsFirst: false })
    query = query.order("id", { ascending: false })
    query = query.range(offset, offset + limit - 1)

    const { data: results, count, error: queryError } = await query
    
    if (queryError) {
      console.error("Catalog query error:", queryError)
      throw queryError
    }

    // --- ОБРАБОТКА ДАННЫХ И ИНТЕГРАЦИЯ СПИСКОВ ---
    // Этот код был неполным в вашем примере, я его дополнил, чтобы он работал
    const finalResults = results?.map((anime) => ({
      ...anime,
      genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
      studios: anime.studios.map((s: any) => s.studios).filter(Boolean),
    }))

    // Добавляем user_list_status только если есть пользователь
    if (user && finalResults && finalResults.length > 0) {
      try {
        const authClient = await createClientAuth()
        const resultIds = finalResults.map((r) => r.id)
        const { data: userListsData } = await authClient
          .from("user_lists")
          .select("anime_id, status")
          .eq("user_id", user.id)
          .in("anime_id", resultIds)

        if (userListsData) {
          const statusMap = new Map(userListsData.map((item) => [item.anime_id, item.status]))
          finalResults.forEach((anime: any) => {
            anime.user_list_status = statusMap.get(anime.id) || null
          })
        }
      } catch (listError) {
        // Игнорируем ошибки при получении списков пользователя
        console.log("Failed to fetch user lists:", listError)
      }
    }

    return NextResponse.json({
      results: finalResults || [],
      total: count,
      hasMore: count ? count > offset + limit : false,
    })
  } catch (error) {
    console.error("Catalog API error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
