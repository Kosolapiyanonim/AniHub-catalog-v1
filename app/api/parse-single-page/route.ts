// /app/api/parse-single-page/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Функция для обработки связей (жанры, студии)
async function processRelations(supabase: any, relationType: 'genre' | 'studio', animeId: number, names: string[]) {
    if (!names || names.length === 0) return;

    const tableName = `${relationType}s`;
    const relationTableName = `anime_${tableName}`;
    const idFieldName = `${relationType}_id`;

    const { data: existingItems } = await supabase.from(tableName).select('id, name').in('name', names);
    const itemMap = new Map((existingItems || []).map((item: any) => [item.name, item.id]));

    const newItems = names.filter(name => !itemMap.has(name)).map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
    if (newItems.length > 0) {
        const { data: insertedItems, error } = await supabase.from(tableName).insert(newItems).select('id, name');
        if (error) throw error;
        (insertedItems || []).forEach((item: any) => itemMap.set(item.name, item.id));
    }
    
    const relationsToUpsert = names.map(name => ({ anime_id: animeId, [idFieldName]: itemMap.get(name) })).filter(Boolean);
    if (relationsToUpsert.length > 0) {
        await supabase.from(relationTableName).upsert(relationsToUpsert);
    }
}

export async function POST(request: Request) {
    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return NextResponse.json({ error: "Переменные окружения не настроены" }, { status: 500 });
    }
    
    // Используем сервисный ключ для обхода RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    try {
        const { nextPageUrl } = await request.json();
        const baseUrl = "https://kodikapi.com";
        let targetUrl: URL;

        if (nextPageUrl) {
            targetUrl = new URL(nextPageUrl, baseUrl);
        } else {
            targetUrl = new URL("/list", baseUrl);
            targetUrl.searchParams.set("token", KODIK_TOKEN);
            targetUrl.searchParams.set("types", "anime,anime-serial");
            targetUrl.searchParams.set("with_material_data", "true");
            targetUrl.searchParams.set("limit", "100");
        }

        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`Ошибка Kodik API: ${response.status}`);
        
        const data = await response.json();
        const animeList = data.results || [];
        if (animeList.length === 0) {
            return NextResponse.json({ message: "Страница пуста.", processed: 0, nextPageUrl: data.next_page || null });
        }
        
        // ... (остальная логика обработки, как мы обсуждали)

        return NextResponse.json({
            message: `Обработано: ${animeList.length} записей.`,
            processed: animeList.length,
            nextPageUrl: data.next_page || null,
        });

    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
