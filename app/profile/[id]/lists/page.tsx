import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { UserListsContent } from "@/components/user-lists-content"
import { notFound } from "next/navigation"

export default async function UserListsPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .eq("id", params.id)
    .single()

  if (error || !profile) {
    console.error("Error fetching profile for lists:", error?.message)
    notFound()
  }

  // Fetch user's anime lists
  const { data: userAnimeLists, error: listsError } = await supabase
    .from("user_anime_lists")
    .select(`
      id,
      status,
      score,
      episodes_watched,
      anime:animes(
        id,
        shikimori_id,
        title,
        title_orig,
        poster_url,
        episodes_total,
        episodes_aired,
        status
      )
    `)
    .eq("user_id", params.id)
    .order("updated_at", { ascending: false })

  if (listsError) {
    console.error("Error fetching user anime lists:", listsError.message)
    // Handle error gracefully, maybe return an empty list or an error message
  }

  const categorizedLists = {
    watching: userAnimeLists?.filter(item => item.status === "watching") || [],
    planned: userAnimeLists?.filter(item => item.status === "planned") || [],
    completed: userAnimeLists?.filter(item => item.status === "completed") || [],
    dropped: userAnimeLists?.filter(item => item.status === "dropped") || [],
    on_hold: userAnimeLists?.filter(item => item.status === "on_hold") || [],
  }

  return (
    <UserListsContent categorizedLists={categorizedLists} />
  )
}
