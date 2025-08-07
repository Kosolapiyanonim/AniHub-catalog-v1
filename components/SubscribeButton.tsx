'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

interface SubscribeButtonProps {
  animeId: string
  userId: string
}

export function SubscribeButton({ animeId, userId }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/subscriptions?userId=${userId}&animeId=${animeId}`)
        if (response.ok) {
          const data = await response.json()
          setIsSubscribed(data && data.length > 0)
        } else {
          console.error('Failed to fetch subscription status')
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setLoading(false)
      }
    }
    checkSubscription()
  }, [animeId, userId])

  const handleSubscribeToggle = async () => {
    if (loading) return

    setLoading(true)
    try {
      const method = isSubscribed ? 'DELETE' : 'POST'
      const response = await fetch('/api/subscriptions', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, animeId }),
      })

      if (response.ok) {
        setIsSubscribed(!isSubscribed)
        toast.success(isSubscribed ? 'Вы отписались от аниме.' : 'Вы подписались на аниме!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Не удалось обновить подписку.')
      }
    } catch (error) {
      console.error('Error toggling subscription:', error)
      toast.error('Произошла ошибка при обновлении подписки.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribeToggle}
      disabled={loading}
      variant={isSubscribed ? 'secondary' : 'default'}
      className="w-full"
    >
      {loading ? (
        'Загрузка...'
      ) : isSubscribed ? (
        <>
          <BellOff className="mr-2 h-4 w-4" />
          Отписаться
        </>
      ) : (
        <>
          <Bell className="mr-2 h-4 w-4" />
          Подписаться
        </>
      )}
    </Button>
  )
}
