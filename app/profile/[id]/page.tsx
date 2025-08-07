import { TabsContent } from '@/components/ui/tabs';
import { UserOverviewContent } from '@/components/user-overview-content';
import { getProfile } from '@/lib/data-fetchers';
import { notFound } from 'next/navigation';

interface ProfileOverviewPageProps {
  params: { id: string };
}

export default async function ProfileOverviewPage({ params }: ProfileOverviewPageProps) {
  const profile = await getProfile(params.id);

  if (!profile) {
    notFound();
  }

  return (
    <TabsContent value="overview">
      <UserOverviewContent profile={profile} />
    </TabsContent>
  );
}
