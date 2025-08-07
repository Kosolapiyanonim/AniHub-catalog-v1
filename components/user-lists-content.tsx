"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimeCard } from "@/components/anime-card"
import { type UserAnimeListItem } from "@/lib/types"

interface UserListsContentProps {
  categorizedLists: {
    watching: UserAnimeListItem[]
    planned: UserAnimeListItem[]
    completed: UserAnimeListItem[]
    dropped: UserAnimeListItem[]
    on_hold: UserAnimeListItem[]
  }
}

export function UserListsContent({ categorizedLists }: UserListsContentProps) {
  const listCategories = [
    { key: "watching", label: "Смотрю", data: categorizedLists.watching },
    { key: "planned", label: "Запланировано", data: categorizedLists.planned },
    { key: "completed", label: "Просмотрено", data: categorizedLists.completed },
    { key: "dropped", label: "Брошено", data: categorizedLists.dropped },
    { key: "on_hold", label: "Отложено", data: categorizedLists.on_hold },
  ]

  return (
    <Tabs defaultValue="watching" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800/50 border-slate-700 mb-4">
        {listCategories.map(category => (
          <TabsTrigger
            key={category.key}
            value={category.key}
            className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300"
          >
            {category.label} ({category.data.length})
          </TabsTrigger>
        ))}
      </TabsList>

      {listCategories.map(category => (
        <TabsContent key={category.key} value={category.key}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">{category.label} аниме</CardTitle>
            </CardHeader>
            <CardContent>
              {category.data.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {category.data.map((item) => (
                      <AnimeCard key={item.anime.id} anime={item.anime} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  В этом списке пока нет аниме.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
