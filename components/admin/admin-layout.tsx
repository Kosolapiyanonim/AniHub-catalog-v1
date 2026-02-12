"use client"

import { AdminNav } from "./admin-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AH</span>
              </div>
              <span className="font-bold text-white">AniHub Admin</span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <AdminNav />
          </div>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Home className="h-4 w-4 mr-2" />
                На сайт
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}





