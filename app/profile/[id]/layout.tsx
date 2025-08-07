import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { UserProfileHeader } from "@/components/user-profile-header"
import { UserProfileTabs } from "@/components/user-profile-tabs"

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, website, bio")
    .eq("id", params.id)
    .single()

  if (error || !profile) {
    console.error("Error fetching profile:", error?.message)
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileHeader profile={profile} />
      <UserProfileTabs userId={profile.id} />
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}
