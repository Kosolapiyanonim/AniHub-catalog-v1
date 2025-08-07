// app/api/anime/[id]/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const shikimoriId = params.id;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // --- ШАГ 1: Получаем сессию пользователя ---
    const { data: { session } } = await supabase.auth.getSession();

    // --- ШАГ 2: Получаем основную информацию об аниме ---
    const { data: anime, error: animeError } = await supabase
      .from('animes_with_relations')
      .select('*')
      .eq('id', shikimoriId)
      .single();

    if (animeError) {
      console.error('Error fetching anime by ID:', animeError);
      return NextResponse.json({ error: animeError.message }, { status: 500 });
    }

    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    // --- ШАГ 3: Получаем статус аниме в списке пользователя (если он авторизован) ---
    let userListStatus: string | null = null;
    if (session) {
      const { data: listData } = await supabase
        .from('user_lists')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('anime_id', anime.id)
        .single();
      
      if (listData) {
        userListStatus = listData.status;
      }
    }

    // --- ШАГ 4: Собираем финальный ответ, добавляя статус пользователя ---
    const responseData = {
      ...anime,
      user_list_status: userListStatus, // <-- Вот добавленная информация
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
