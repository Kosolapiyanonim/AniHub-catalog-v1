import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher } from "@/lib/role-utils"
import { AdminLayout } from "@/components/admin/admin-layout"

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    redirect("/login?redirect=/admin")
  }

  // Check user role
  const userRole = await getUserRole(supabase, session.user.id)
  
  if (!isManagerOrHigher(userRole)) {
    redirect("/?error=access_denied")
  }

  return <AdminLayout>{children}</AdminLayout>
}

