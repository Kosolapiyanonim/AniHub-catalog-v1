'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UserProfileTabsProps {
  userId: string;
}

export function UserProfileTabs({ userId }: UserProfileTabsProps) {
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop() || 'overview';

  return (
    <Tabs value={activeTab} className="w-full mt-8">
      <TabsList className="grid w-full grid-cols-3 bg-slate-800 text-white">
        <Link href={`/profile/${userId}`} passHref>
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Обзор
          </TabsTrigger>
        </Link>
        <Link href={`/profile/${userId}/lists`} passHref>
          <TabsTrigger value="lists" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Мои списки
          </TabsTrigger>
        </Link>
        <Link href={`/profile/${userId}/settings`} passHref>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Настройки
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}
