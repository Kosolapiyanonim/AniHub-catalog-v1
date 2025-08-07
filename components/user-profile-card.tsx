'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'
import { Pencil } from 'lucide-react'

interface UserProfileCardProps {
  user: SupabaseUser
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const getUserInitials = (user: SupabaseUser) => {
    const name = user.user_metadata?.full_name || user.email
    return name?.charAt(0).toUpperCase() || 'U'
  }

  const getUserName = (user: SupabaseUser) => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.user_metadata?.avatar_url || '/placeholder.svg'} alt={getUserName(user)} />
            <AvatarFallback className="text-3xl">{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{getUserName(user)}</CardTitle>
            <CardDescription className="text-muted-foreground">{user.email}</CardDescription>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Редактировать профиль
        </Button>
      </CardHeader>
      <CardContent>
        {/* Здесь можно добавить дополнительную информацию или статистику */}
        <p className="text-sm text-muted-foreground mt-4">
          Добро пожаловать на вашу страницу профиля! Здесь вы можете управлять своими списками аниме и настройками.
        </p>
      </CardContent>
    </Card>
  )
}
