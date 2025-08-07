'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Profile } from '@/lib/types';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserSettingsContentProps {
  profile: Profile;
}

export function UserSettingsContent({ profile }: UserSettingsContentProps) {
  const supabase = createClientComponentClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("Новый пароль и подтверждение не совпадают.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов.");
      return;
    }

    setIsPasswordChanging(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsPasswordChanging(false);

    if (error) {
      console.error('Error changing password:', error);
      toast.error(`Ошибка смены пароля: ${error.message}`);
    } else {
      toast.success("Пароль успешно изменен!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Информация об аккаунте</CardTitle>
          <CardDescription className="text-slate-400">
            Ваш адрес электронной почты и дата регистрации.
          </CardDescription>
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

      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Смена пароля</CardTitle>
          <CardDescription className="text-slate-400">
            Обновите свой пароль для безопасности аккаунта.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword" className="text-slate-300">Новый пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword" className="text-slate-300">Подтвердите новый пароль</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-1"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={isPasswordChanging} className="bg-purple-600 hover:bg-purple-700">
            {isPasswordChanging ? 'Меняем пароль...' : 'Сменить пароль'}
          </Button>
        </CardContent>
      </Card>

      {/* Optional: Notifications Settings */}
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-purple-400">Настройки уведомлений</CardTitle>
          <CardDescription className="text-slate-400">
            Управляйте тем, как вы получаете уведомления.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Функционал уведомлений будет добавлен позже.</p>
          {/* Placeholder for notification toggles */}
        </CardContent>
      </Card>
    </div>
  );
}
