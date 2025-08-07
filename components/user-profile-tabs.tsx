"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface UserProfileTabsProps {
  userId: string
}

export function UserProfileTabs({ userId }: UserProfileTabsProps) {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname.endsWith("/lists")) return "lists"
    if (pathname.endsWith("/settings")) return "settings"
    return "overview"
  }

  return (
    <Tabs defaultValue="overview" value={getActiveTab()} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
        <Link href={`/profile/${userId}`} passHref>
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
            Обзор
          </TabsTrigger>
        </Link>
        <Link href={`/profile/${userId}/lists`} passHref>
          <TabsTrigger value="lists" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
            Мои списки
          </TabsTrigger>
        </Link>
        <Link href={`/profile/${userId}/settings`} passHref>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
            Настройки
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  )
}
