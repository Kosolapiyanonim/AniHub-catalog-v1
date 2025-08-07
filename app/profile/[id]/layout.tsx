import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getProfile } from '@/lib/data-fetchers';
import { UserProfileHeader } from '@/components/user-profile-header';
import { UserProfileTabs } from '@/components/user-profile-tabs';
import { Profile } from '@/lib/types';

interface ProfileLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const profile: Profile | null = await getProfile(params.id);

  if (!profile) {
    notFound();
  }

  const isCurrentUser = user?.id === params.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
      <UserProfileTabs userId={params.id} />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
