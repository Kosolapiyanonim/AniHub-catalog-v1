// /app/api/lists/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime_id = searchParams.get("anime_id");

  if (!anime_id) {
    return NextResponse.json({ error: "anime_id is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Получаем сессию текущего пользователя
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ищем запись в списке для этого пользователя и аниме
  const { data, error } = await supabase
    .from("user_lists")
    .select("status, progress, score")
    .eq("user_id", session.user.id)
    .eq("anime_id", anime_id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 - это "не найдено", это не ошибка
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data); // вернет { status: 'watching' } или null
}

export async function POST(request: Request) {
  const { anime_id, status, progress, score } = await request.json();

  if (!anime_id || !status) {
    return NextResponse.json({ error: "anime_id and status are required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Получаем сессию текущего пользователя
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Если статус 'remove', удаляем запись
  if (status === 'remove') {
    const { error } = await supabase
      .from("user_lists")
      .delete()
      .eq("user_id", session.user.id)
      .eq("anime_id", anime_id);
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Successfully removed" });
  }

  // Иначе, обновляем или вставляем новую запись
  const { error } = await supabase.from("user_lists").upsert({
    user_id: session.user.id,
    anime_id,
    status,
    progress,
    score,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "List updated successfully" });
}
