import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { UserSettingsContent } from "@/components/user-settings-content"
import { notFound } from "next/navigation"

export default async function UserSettingsPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, website, bio")
    .eq("id", params.id)
    .single()

  if (error || !profile) {
    console.error("Error fetching profile for settings:", error?.message)
    notFound()
  }

  // In a real application, you'd also fetch user-specific settings here
  // For now, we'll just pass the profile data.

  return (
    <UserSettingsContent profile={profile} />
  )
}
