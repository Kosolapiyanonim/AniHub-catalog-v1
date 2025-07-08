// /app/api/test/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic'; // Указывает Vercel не кэшировать этот маршрут

export async function GET() {
  try {
    // Делаем очень простой и быстрый запрос к базе данных,
    // чтобы проверить, есть ли соединение.
    // Мы запрашиваем всего одну запись и только ее ID.
    const { error } = await supabase.from('animes').select('id').limit(1);

    // Если при запросе произошла ошибка, значит, с базой данных что-то не так.
    if (error) {
      throw error;
    }

    // Если все прошло успешно, отправляем ответ "ok".
    return NextResponse.json({ status: "ok" });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка базы данных";
    console.error("Database Test Error:", err);
    
    // Если что-то пошло не так, отправляем ошибку 500.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
