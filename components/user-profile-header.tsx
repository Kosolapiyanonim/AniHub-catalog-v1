'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';
import { EditProfileDialog } from './edit-profile-dialog';
import { updateProfile } from '@/lib/data-fetchers';
import { toast } from 'sonner';

interface UserProfileHeaderProps {
  profile: Profile;
  isCurrentUser: boolean;
}

export function UserProfileHeader({ profile, isCurrentUser }: UserProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const handleSaveProfile = async (updatedFields: Partial<Profile>) => {
    if (!currentProfile.id) return;

    const result = await updateProfile(currentProfile.id, updatedFields);
    if (result) {
      setCurrentProfile(result);
      toast.success("Профиль успешно обновлен!");
    } else {
      toast.error("Не удалось обновить профиль.");
    }
    setIsEditDialogOpen(false);
  };

  const getUserInitials = (profile: Profile) => {
    const name = profile.full_name || profile.username || profile.email;
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-slate-800 rounded-lg shadow-lg">
      <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-purple-500">
        <AvatarImage src={currentProfile.avatar_url || "/placeholder-user.jpg"} alt={`${currentProfile.username || currentProfile.full_name}'s avatar`} />
        <AvatarFallback className="text-4xl bg-slate-700 text-white">{getUserInitials(currentProfile)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-white">
          {currentProfile.full_name || currentProfile.username || "Пользователь"}
        </h1>
        {currentProfile.full_name && currentProfile.username && (
          <p className="text-lg text-slate-400 mt-1">@{currentProfile.username}</p>
        )}
        <p className="text-md text-slate-300 mt-2">{currentProfile.email}</p>
        {currentProfile.bio && (
          <p className="text-slate-300 mt-4 max-w-prose">{currentProfile.bio}</p>
        )}
        {currentProfile.website && (
          <Link href={currentProfile.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline mt-2 block">
            {currentProfile.website}
          </Link>
        )}
        {isCurrentUser && (
          <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setIsEditDialogOpen(true)}>
            Редактировать профиль
          </Button>
        )}
      </div>

      {isCurrentUser && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={currentProfile}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
