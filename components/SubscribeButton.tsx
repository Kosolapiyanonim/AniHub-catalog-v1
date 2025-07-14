"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';

interface SubscribeButtonProps {
  animeId: number;
}

export function SubscribeButton({ animeId }: SubscribeButtonProps) {
  const { session } = useSupabase();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions?anime_id=${animeId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.subscribed);
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    } finally {
      setLoading(false);
    }
  }, [animeId, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const handleSubscribe = async () => {
    if (!session) {
      toast.error("Нужно войти в аккаунт для подписки");
      return;
    }
    setLoading(true);
    const newSubscribedState = !isSubscribed;
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anime_id: animeId, subscribed: newSubscribedState }),
      });

      if (!response.ok) {
        throw new Error("Ошибка подписки");
      }

      setIsSubscribed(newSubscribedState);
      toast.success(newSubscribedState ? "Вы подписались на обновления" : "Вы отписались от обновлений");
    } catch (error) {
      toast.error("Не удалось изменить статус подписки");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null; // Don't show the button for guests
  }

  return (
    <Button
      onClick={handleSubscribe}
      variant="ghost"
      size="icon"
      disabled={loading}
      className="text-gray-400 hover:text-white"
      title={isSubscribed ? "Отписаться от обновлений" : "Подписаться на обновления"}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-5 h-5 text-purple-400" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
    </Button>
  );
}
