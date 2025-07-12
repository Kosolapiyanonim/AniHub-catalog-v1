// /components/SubscribeButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useSupabase } from './supabase-provider';
import { toast } from 'sonner';

export function SubscribeButton({ animeId }: { animeId: number }) {
    const { session } = useSupabase();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }
        fetch(`/api/subscriptions?anime_id=${animeId}`)
            .then(res => res.json())
            .then(data => setIsSubscribed(data.subscribed))
            .finally(() => setLoading(false));
    }, [session, animeId]);

    const handleSubscribe = async () => {
        if (!session) return toast.error("Нужно войти в аккаунт");
        setLoading(true);
        const newSubscribedState = !isSubscribed;
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ anime_id: animeId, subscribed: newSubscribedState })
            });
            if (!response.ok) throw new Error("Ошибка подписки");
            setIsSubscribed(newSubscribedState);
            toast.success(newSubscribedState ? "Вы подписались на обновления" : "Вы отписались от обновлений");
        } catch (error) {
            toast.error("Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    return (
        <Button onClick={handleSubscribe} variant="ghost" size="icon" disabled={loading} className="text-gray-400 hover:text-white" title={isSubscribed ? "Отписаться от обновлений" : "Подписаться на обновления"}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
             isSubscribed ? <BellRing className="w-5 h-5 text-purple-400" /> : <Bell className="w-5 h-5" />}
        </Button>
    );
}
