import { NextRequest, NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher } from "@/lib/role-utils"

export const dynamic = "force-dynamic"

// PATCH - массовое обновление аниме
export async function PATCH(request: NextRequest) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const userRole = await getUserRole(supabase, user.id)
  if (!isManagerOrHigher(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin or manager access required" }, { status: 403, headers: response.headers })
  }

  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Updates array is required" }, { status: 400, headers: response.headers })
    }

    // Allowed fields for bulk update
    const allowedFields = ["status", "year"]

    // Validate updates
    for (const update of updates) {
      if (!update.id || typeof update.id !== "number") {
        return NextResponse.json({ error: "Invalid update: id is required" }, { status: 400, headers: response.headers })
      }

      const updateFields = Object.keys(update).filter((key) => key !== "id")
      for (const field of updateFields) {
        if (!allowedFields.includes(field)) {
          return NextResponse.json({ error: `Field ${field} is not allowed for bulk update` }, { status: 400, headers: response.headers })
        }
      }
    }

    // Perform updates
    const results = []
    for (const update of updates) {
      const { id, ...updateData } = update
      
      const { error } = await supabase
        .from("animes")
        .update(updateData)
        .eq("id", id)

      if (error) {
        console.error(`Error updating anime ${id}:`, error)
        results.push({ id, success: false, error: error.message })
      } else {
        results.push({ id, success: true })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json(
      {
        success: true,
        updated: successCount,
        failed: failCount,
        results,
      },
      { headers: response.headers }
    )
  } catch (error) {
    console.error("Bulk update error:", error)
    return NextResponse.json(
      { error: "Failed to update animes" },
      { status: 500, headers: response.headers }
    )
  }
}





