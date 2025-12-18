import { NextRequest, NextResponse } from "next/server";
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server";
import { getUserRole, isAdmin } from "@/lib/role-utils";

export const dynamic = "force-dynamic";

// GET - получить список пользователей с ролями
export async function GET(request: NextRequest) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });
  }

  // Проверяем, что пользователь - администратор
  const userRole = await getUserRole(supabase, user.id);
  if (!isAdmin(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403, headers: response.headers });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let query = supabase
      .from("profiles")
      .select("id, username, avatar_url, role, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Поиск по username, если указан
    if (search) {
      query = query.ilike("username", `%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Ошибка при получении пользователей:", error);
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    }

    // Получаем общее количество пользователей для пагинации
    let countQuery = supabase.from("profiles").select("id", { count: "exact", head: true });
    if (search) {
      countQuery = countQuery.ilike("username", `%${search}%`);
    }
    const { count } = await countQuery;

    return NextResponse.json(
      {
        users: users || [],
        total: count || 0,
        limit,
        offset,
      },
      { headers: response.headers }
    );
  } catch (error) {
    console.error("Ошибка в GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500, headers: response.headers }
    );
  }
}

// PATCH - обновить роль пользователя
export async function PATCH(request: NextRequest) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });
  }

  // Проверяем, что пользователь - администратор
  const userRole = await getUserRole(supabase, user.id);
  if (!isAdmin(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403, headers: response.headers });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId и role обязательны" },
        { status: 400, headers: response.headers }
      );
    }

    // Проверяем, что роль валидна
    const validRoles = ["admin", "manager", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Роль должна быть одной из: ${validRoles.join(", ")}` },
        { status: 400, headers: response.headers }
      );
    }

    // Не позволяем удалять роль админа у самого себя
    if (userId === user.id && role !== "admin") {
      return NextResponse.json(
        { error: "Вы не можете изменить свою собственную роль администратора" },
        { status: 400, headers: response.headers }
      );
    }

    // Обновляем роль пользователя
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id, username, avatar_url, role, created_at, updated_at")
      .single();

    if (updateError) {
      console.error("Ошибка при обновлении роли:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500, headers: response.headers });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Роль успешно обновлена",
        user: data,
      },
      { headers: response.headers }
    );
  } catch (error) {
    console.error("Ошибка в PATCH /api/admin/users:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500, headers: response.headers }
    );
  }
}

