"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { useState } from "react"
import { type Profile } from "@/lib/types"
import { useSupabase } from "@/components/supabase-provider"

interface UserProfileCardProps {
  profile: Profile
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { session } = useSupabase()
  const isCurrentUser = session?.user?.id === profile.id

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-purple-500">
          <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} alt={profile.username || "User"} />
          <AvatarFallback className="text-4xl font-bold bg-purple-600 text-white">
            {profile.username ? profile.username[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-1">{profile.full_name || profile.username || "Пользователь"}</h1>
          {profile.username && profile.full_name && (
            <p className="text-slate-400 text-sm mb-2">@{profile.username}</p>
          )}
          <p className="text-slate-300 mb-4 max-w-prose">{profile.bio || "Пользователь пока не добавил описание."}</p>
          {profile.website && (
            <p className="text-slate-400 text-sm mb-2">
              Вебсайт: <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{profile.website}</a>
            </p>
          )}
          {isCurrentUser && (
            <Button
              variant="outline"
              className="mt-4 border-purple-600 text-purple-300 hover:bg-purple-700/20 bg-transparent"
              onClick={() => setIsEditing(true)}
            >
              Редактировать профиль
            </Button>
          )}
        </div>
      </CardContent>
      {isCurrentUser && (
        <EditProfileDialog
          profile={profile}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Card>
  )
}
