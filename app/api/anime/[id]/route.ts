// Замените содержимое файла: /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // **ИСПРАВЛЕНИЕ:** ID теперь является kodik_id (например, "serial-12345").
    // Проверяем, что он не пустой и не "undefined".
    if (!id || id === "undefined") {
      return NextResponse.json({ error: "Invalid anime ID format" }, { status: 400 });
    }

    console.log("🎬 Fetching anime data for kodik_id:", id);

    // **ИСПРАВЛЕНИЕ:** Ищем по kodik_id в нашем VIEW.
    const { data, error } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("kodik_id", id) // Ищем по kodik_id
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
         console.log(`❌ Anime with kodik_id ${id} not found in DB.`);
         return NextResponse.json({ error: "Anime not found" }, { status: 404 });
      }
      console.error(`❌ Database error for kodik_id ${id}:`, error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log("✅ Anime found:", data.title);
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error in anime API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
