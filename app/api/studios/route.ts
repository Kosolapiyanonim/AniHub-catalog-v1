// Создайте новый файл: /app/api/studios/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🏢 Fetching studios from database...");

    // Получаем все уникальные студии из базы, отсортированные по имени
    const { data, error } = await supabase
      .from("studios")
      .select("name")
      .order("name");

    if (error) {
      console.error("❌ Error fetching studios:", error);
      throw error;
    }

    const studios = data?.map((item) => item.name) || [];
    console.log(`✅ Found ${studios.length} studios`);

    return NextResponse.json({
      studios,
      total: studios.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("❌ Studios API error:", message);
    return NextResponse.json({ status: "error", message, studios: [] }, { status: 500 });
  }
}
