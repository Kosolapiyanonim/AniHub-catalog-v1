// /app/api/parse-latest/route.ts
// Логика здесь будет очень похожа на parse-single-page,
// но она будет запрашивать только 1-2 страницы с сортировкой по `updated_at`.
// Для краткости я покажу только ключевое отличие.

import { NextResponse } from "next/server";
// ... импорты

export async function POST(request: Request) {
    // ... (код для подключения к Supabase)

    try {
        const targetUrl = new URL("/list", "https://kodikapi.com");
        targetUrl.searchParams.set("token", KODIK_TOKEN);
        targetUrl.searchParams.set("limit", "100");
        targetUrl.searchParams.set("sort", "updated_at"); // <-- ГЛАВНОЕ ОТЛИЧИЕ
        // ... (дальше код обработки такой же, как в parse-single-page)

        return NextResponse.json({ message: `Последние обновления обработаны. Найдено: ${animeList.length}` });
    } catch (err) {
        // ... (обработка ошибок)
    }
}
