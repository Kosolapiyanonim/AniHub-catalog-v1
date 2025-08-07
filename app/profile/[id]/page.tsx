import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { UserOverviewContent } from "@/components/user-overview-content"
import { notFound } from "next/navigation"

export default async function UserOverviewPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, website, bio")
    .eq("id", params.id)
    .single()

  if (error || !profile) {
    console.error("Error fetching profile for overview:", error?.message)
    notFound()
  }

  return (
    <UserOverviewContent profile={profile} />
  )
}
