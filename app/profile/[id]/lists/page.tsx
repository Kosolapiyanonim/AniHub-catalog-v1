import { TabsContent } from '@/components/ui/tabs';
import { UserListsContent } from '@/components/user-lists-content';
import { getUserAnimeLists } from '@/lib/data-fetchers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ProfileListsPageProps {
  params: { id: string };
}

export default async function ProfileListsPage({ params }: ProfileListsPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== params.id) {
    // For now, only allow viewing own lists. Can be changed later for public lists.
    notFound();
  }

  const userLists = await getUserAnimeLists(params.id);

  return (
    <TabsContent value="lists">
      <UserListsContent initialLists={userLists} userId={params.id} />
    </TabsContent>
  );
}
