'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/components/supabase-provider';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';

interface UserSettingsContentProps {
  profile: Profile;
}

export function UserSettingsContent({ profile }: UserSettingsContentProps) {
  const { toast } = useToast();
  const { supabase, session } = useSupabase();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Placeholder for actual setting
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!session?.user) {
      toast({
        title: "Ошибка",
        description: "Вы не авторизованы.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Ошибка",
        description: "Новый пароль и подтверждение не совпадают.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 6 символов.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPassword(true);
    // Supabase does not directly support changing password with old password for security reasons
    // It typically uses a password reset flow or requires re-authentication.
    // For simplicity, this example will just update the password directly if user is logged in.
    // In a real app, consider using `supabase.auth.updateUser({ password: newPassword })`
    // and potentially re-authenticating the user first.
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsSavingPassword(false);

    if (error) {
      toast({
        title: "Ошибка смены пароля",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Пароль успешно изменен.",
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      router.refresh();
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: "Настройки уведомлений",
      description: `Уведомления ${notificationsEnabled ? "отключены" : "включены"}.`,
    });
    // In a real app, update this setting in the database
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Информация об аккаунте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-300">Электронная почта</Label>
            <Input id="email" value={profile.email} disabled className="bg-slate-700 border-slate-600 text-slate-300 mt-1" />
          </div>
          <div>
            <Label htmlFor="registrationDate" className="text-slate-300">Дата регистрации</Label>
            <Input id="registrationDate" value={new Date(profile.created_at).toLocaleDateString()} disabled className="bg-slate-700 border-slate-600 text-slate-300 mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Изменить пароль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="old-password" className="text-slate-300">Старый пароль</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password" className="text-slate-300">Новый пароль</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-new-password" className="text-slate-300">Подтвердите новый пароль</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isSavingPassword || !oldPassword || !newPassword || !confirmNewPassword}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSavingPassword ? "Сохранение..." : "Изменить пароль"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Настройки уведомлений</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-slate-300">Получать уведомления</Label>
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
            className="data-[state=checked]:bg-purple-600"
          />
        </CardContent>
      </Card>

      {/* Optional: Notifications Settings */}
      {/* Add more settings sections as needed, e.g., Privacy, Account Deletion */}
    </div>
  );
}
