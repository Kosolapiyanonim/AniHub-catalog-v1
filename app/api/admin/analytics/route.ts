import { NextRequest, NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher } from "@/lib/role-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  // Check if user has admin or manager role
  const userRole = await getUserRole(supabase, user.id)
  if (!isManagerOrHigher(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin or manager access required" }, { status: 403, headers: response.headers })
  }

  try {
    // Get statistics
    const [
      { count: totalUsers },
      { count: totalAnimes },
      { count: totalComments },
      { count: totalAdmins },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("animes").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ])

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: recentUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())

    // Get recent comments (last 7 days)
    const { count: recentComments } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())

    // Get popular animes (by shikimori_rating)
    const { data: popularAnimes } = await supabase
      .from("animes")
      .select("id, title, shikimori_rating, shikimori_votes")
      .not("shikimori_rating", "is", null)
      .order("shikimori_rating", { ascending: false })
      .limit(10)

    // Get users by role
    const { data: usersByRole } = await supabase
      .from("profiles")
      .select("role")
    
    const roleCounts = {
      admin: 0,
      manager: 0,
      viewer: 0,
    }
    
    usersByRole?.forEach((user) => {
      if (user.role in roleCounts) {
        roleCounts[user.role as keyof typeof roleCounts]++
      }
    })

    return NextResponse.json(
      {
        stats: {
          totalUsers: totalUsers || 0,
          totalAnimes: totalAnimes || 0,
          totalComments: totalComments || 0,
          totalAdmins: totalAdmins || 0,
          recentUsers: recentUsers || 0,
          recentComments: recentComments || 0,
        },
        roleCounts,
        popularAnimes: popularAnimes || [],
      },
      { headers: response.headers }
    )
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500, headers: response.headers }
    )
  }
}





