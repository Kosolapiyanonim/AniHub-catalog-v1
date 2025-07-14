"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"

export type SubscribeButtonProps = {
  /** ID of the anime to (un)subscribe to */
  animeId: number | string
  /** Initial “subscribed” state sent from the server (optional) */
  initialSubscribed?: boolean
}

/**
 * SubscribeButton – allows a logged-in user to subscribe / unsubscribe
 * to notifications for a given anime.
 * Exports:
 *   • named  ➜ SubscribeButton
 *   • default ➜ SubscribeButton
 */
export function SubscribeButton({ animeId, initialSubscribed = false }: SubscribeButtonProps) {
  const { client } = useSupabase()
  const { toast } = useToast()
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [isPending, startTransition] = useTransition()

  async function toggleSubscribe() {
    // Check auth session first
    const {
      data: { session },
    } = await client.auth.getSession()

    if (!session?.user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите, чтобы подписаться на обновления.",
      })
      return
    }

    // Optimistic UI update
    startTransition(() => {
      setSubscribed((prev) => !prev)
      client
        .from("subscriptions")
        .upsert({
          user_id: session.user.id,
          anime_id: animeId,
          is_subscribed: !subscribed,
        })
        .then(({ error }) => {
          if (error) {
            // Roll back on error
            setSubscribed((prev) => !prev)
            toast({
              title: "Ошибка",
              description: "Не удалось обновить подписку.",
            })
          } else {
            toast({
              title: !subscribed ? "Вы успешно подписались!" : "Подписка отменена",
            })
          }
        })
    })
  }

  return (
    <Button variant={subscribed ? "secondary" : "default"} size="sm" onClick={toggleSubscribe} disabled={isPending}>
      {subscribed ? "Отписаться" : "Подписаться"}
    </Button>
  )
}

export default SubscribeButton
