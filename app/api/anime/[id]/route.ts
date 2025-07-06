// /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("shikimori_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
