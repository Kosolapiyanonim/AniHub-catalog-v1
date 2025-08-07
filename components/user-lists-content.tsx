'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAnimeList, AnimeListStatus } from '@/lib/types';
import { AnimeCard } from '@/components/anime-card'; // Assuming you have an AnimeCard component
import { getUserAnimeLists } from '@/lib/data-fetchers';
import { useQuery } from '@tanstack/react-query'; // Assuming react-query is used for client-side fetching

interface UserListsContentProps {
  initialLists: UserAnimeList[];
  userId: string;
}

const statusMap: { [key in AnimeListStatus]: string } = {
  watching: 'Смотрю',
  completed: 'Просмотрено',
  planned: 'Запланировано',
  dropped: 'Брошено',
  on_hold: 'Отложено',
  favorite: 'Избранное',
};

export function UserListsContent({ initialLists, userId }: UserListsContentProps) {
  const [activeTab, setActiveTab] = useState<AnimeListStatus>('watching');

  const { data: lists, isLoading, error } = useQuery<UserAnimeList[], Error>({
    queryKey: ['userLists', userId, activeTab],
    queryFn: () => getUserAnimeLists(userId, activeTab),
    initialData: initialLists.filter(list => list.status === activeTab), // Filter initial data for the active tab
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const allStatuses: AnimeListStatus[] = ['watching', 'completed', 'planned', 'dropped', 'on_hold', 'favorite'];

  if (isLoading) return <div className="text-center text-white">Загрузка списков...</div>;
  if (error) return <div className="text-center text-red-500">Ошибка загрузки списков: {error.message}</div>;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnimeListStatus)}>
        <TabsList className="flex flex-wrap h-auto p-1 bg-slate-800 text-white">
          {allStatuses.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white whitespace-nowrap"
            >
              {statusMap[status]}
            </TabsTrigger>
          ))}
        </TabsList>
        {allStatuses.map((status) => (
          <TabsContent key={status} value={status}>
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">{statusMap[status]} Аниме</CardTitle>
              </CardHeader>
              <CardContent>
                {lists && lists.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {lists.map((item) => (
                      <AnimeCard key={item.anime.id} anime={item.anime} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">В этом списке пока нет аниме.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
