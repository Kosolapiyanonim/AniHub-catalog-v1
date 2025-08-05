"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, X } from "lucide-react"

export function SubscribeButton() {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setIsSubscribed(false)
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/subscriptions?userId=${user.id}`)
        const data = await response.json()
        setIsSubscribed(!!data)
      } catch (error) {
        console.error("Error fetching subscription status:", error)
        setIsSubscribed(false)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить статус подписки.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptionStatus()
  }, [user, supabase, toast])

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Необходимо войти",
        description: "Пожалуйста, войдите, чтобы оформить подписку.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate a subscription process
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month subscription

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          plan: "premium",
          expires_at: expiresAt.toISOString(),
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        toast({
          title: "Подписка оформлена",
          description: "Вы успешно оформили премиум-подписку!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Ошибка",
          description: errorData.error || "Не удалось оформить подписку.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при оформлении подписки.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/subscriptions?userId=${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsSubscribed(false)
        toast({
          title: "Подписка отменена",
          description: "Ваша подписка успешно отменена.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Ошибка",
          description: errorData.error || "Не удалось отменить подписку.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отмене подписки.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Загрузка...
      </Button>
    )
  }

  return (
    <>
      {isSubscribed ? (
        <Button onClick={handleCancelSubscription} variant="destructive">
          <X className="mr-2 h-4 w-4" />
          Отменить подписку
        </Button>
      ) : (
        <Button onClick={handleSubscribe}>
          <Check className="mr-2 h-4 w-4" />
          Оформить подписку
        </Button>
      )}
    </>
  )
}
