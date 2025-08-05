// /app/api/parser/route.ts

import { NextResponse } from "next/server"
import { parseLatestAnime } from "@/lib/parser-utils"

// ====================================================================
// GET-обработчик для проверки статуса (решает ошибку 405)
// ====================================================================
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Parser API is online." })
}

// ====================================================================
// Вспомогательные функции для ОПТИМИЗИРОВАННОЙ обработки связей
// ====================================================================

/**
 * Обрабатывает один тип связей (например, все жанры со страницы) одним пакетом.
 */
async function processRelationsBatch(
  supabaseClient: any,
  relationData: { anime_id: number; name: string }[],
  relation_type: "genre" | "studio" | "country",
) {
  if (!relationData || relationData.length === 0) return

  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`
  const idFieldName = `${relation_type}_id`
  const relationTableName = `anime_${tableName}`

  // 1. Получаем уникальные имена и добавляем их в справочник (genres, studios, etc.)
  const uniqueNames = [...new Set(relationData.map((r) => r.name))]
  const { data: existingItems, error: upsertError } = await supabaseClient
    .from(tableName)
    .upsert(
      uniqueNames.map((name) => ({ name })),
      { onConflict: "name" },
    )
    .select("id, name")

  if (upsertError) throw upsertError
  if (!existingItems) return

  // 2. Создаем карту "имя -> id" для быстрого доступа
  const itemMap = new Map(existingItems.map((item) => [item.name, item.id]))

  // 3. Формируем записи для таблицы связей (anime_genres, etc.)
  const relationsToUpsert = relationData
    .map((rel) => {
      const relationId = itemMap.get(rel.name)
      if (!relationId) return null
      return {
        anime_id: rel.anime_id,
        [idFieldName]: relationId,
      }
    })
    .filter(Boolean)

  // 4. Добавляем все связи одним запросом
  if (relationsToUpsert.length > 0) {
    const { error: relationError } = await supabaseClient
      .from(relationTableName)
      .upsert(relationsToUpsert, { onConflict: `anime_id,${idFieldName}` })

    if (relationError) console.error(`Ошибка при пакетной вставке в ${relationTableName}:`, relationError)
  }
}

// ====================================================================
// Основной POST-обработчик с новой, оптимизированной логикой
// ====================================================================
export async function POST(request: Request) {
  try {
    const { count, offset } = await request.json()
    console.log(`Starting parsing latest anime: count=${count}, offset=${offset}`)
    const result = await parseLatestAnime(count, offset)
    console.log("Finished parsing latest anime.")
    return NextResponse.json({
      message: "Latest anime parsing initiated",
      parsedCount: result.parsedCount,
      skippedCount: result.skippedCount,
    })
  } catch (error: any) {
    console.error("Error during latest anime parsing:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
