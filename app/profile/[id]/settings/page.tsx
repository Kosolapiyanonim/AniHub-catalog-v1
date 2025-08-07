import { TabsContent } from '@/components/ui/tabs';
import { UserSettingsContent } from '@/components/user-settings-content';
import { getProfile } from '@/lib/data-fetchers';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ProfileSettingsPageProps {
  params: { id: string };
}

export default async function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== params.id) {
    // Only allow current user to access settings
    notFound();
  }

  const profile = await getProfile(params.id);

  if (!profile) {
    notFound();
  }

  return (
    <TabsContent value="settings">
      <UserSettingsContent profile={profile} />
    </TabsContent>
  );
}
