"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, User, Save } from "lucide-react"

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const userId = params.id as string
  const isOwnProfile = session?.user?.id === userId

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/profile${isOwnProfile ? "" : `?userId=${userId}`}`, {
          cache: "no-store",
        })
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Failed to load profile" }))
          throw new Error(errorData.error || "Failed to load profile")
        }
        
        const data = await res.json()
        setProfile(data)
        setUsername(data.username || "")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [userId, isOwnProfile])

  const handleSave = async () => {
    if (!isOwnProfile) {
      toast.error("Вы можете редактировать только свой профиль")
      return
    }

    if (!username.trim()) {
      toast.error("Никнейм не может быть пустым")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to update profile" }))
        throw new Error(errorData.error || "Failed to update profile")
      }

      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      toast.success("Никнейм обновлен!")
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to update profile"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-red-400">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-slate-400">Профиль не найден</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.username || "Пользователь"}</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Ваш профиль" : "Профиль пользователя"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isOwnProfile ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Никнейм</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите никнейм"
                    maxLength={30}
                    disabled={saving}
                  />
                  <Button onClick={handleSave} disabled={saving || username.trim() === profile.username}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  Минимум 3 символа, максимум 30. Никнейм должен быть уникальным.
                </p>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  <strong className="text-slate-300">Email:</strong> {session?.user?.email}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  <strong className="text-slate-300">Дата регистрации:</strong>{" "}
                  {new Date(profile.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Никнейм:</strong> {profile.username || "Не установлен"}
              </p>
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Дата регистрации:</strong>{" "}
                {new Date(profile.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
