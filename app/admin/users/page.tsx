"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Shield, User, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/role-utils";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface UsersResponse {
  users: UserProfile[];
  total: number;
  limit: number;
  offset: number;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  viewer: "Зритель",
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/50",
  manager: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  viewer: "bg-slate-500/20 text-slate-400 border-slate-500/50",
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username?.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        if (response.status === 403) {
          setError("У вас нет прав доступа к этой странице");
          toast.error("Только администраторы могут управлять ролями");
        } else if (response.status === 401) {
          setError("Необходима авторизация");
          toast.error("Войдите в систему");
        } else {
          const errorData = await response.json().catch(() => ({ error: "Ошибка при загрузке пользователей" }));
          setError(errorData.error || "Ошибка при загрузке пользователей");
          toast.error(errorData.error || "Не удалось загрузить пользователей");
        }
        return;
      }
      const data: UsersResponse = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setError("Не удалось загрузить пользователей");
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdatingRoles((prev) => new Set(prev).add(userId));
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Ошибка при обновлении роли" }));
        toast.error(errorData.error || "Не удалось обновить роль");
        return;
      }

      const data = await response.json();
      toast.success(`Роль успешно изменена на "${roleLabels[newRole]}"`);
      
      // Обновляем локальное состояние
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole, updated_at: new Date().toISOString() } : user))
      );
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      toast.error("Не удалось обновить роль");
    } finally {
      setUpdatingRoles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getUserInitials = (user: UserProfile) => {
    const name = user.username || user.id;
    return name?.charAt(0).toUpperCase() || "U";
  };

  if (error && !loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ошибка доступа</h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button onClick={loadUsers} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Управление пользователями
              </CardTitle>
              <CardDescription className="mt-1">
                Управление ролями пользователей. Всего пользователей: {total}
              </CardDescription>
            </div>
            <Button onClick={loadUsers} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Поиск по имени пользователя или ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Список пользователей */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400">Загрузка пользователей...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-400">
                  {searchQuery ? "Пользователи не найдены" : "Пользователи не найдены"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-slate-700 text-slate-300">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">
                            {user.username || `user_${user.id.slice(0, 8)}`}
                          </p>
                          <Badge
                            variant="outline"
                            className={roleColors[user.role]}
                          >
                            {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                            {user.role === "manager" && <User className="h-3 w-3 mr-1" />}
                            {roleLabels[user.role]}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate">ID: {user.id}</p>
                        <p className="text-xs text-slate-500">
                          Создан: {new Date(user.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                        disabled={updatingRoles.has(user.id)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Зритель
                            </div>
                          </SelectItem>
                          <SelectItem value="manager">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Менеджер
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Администратор
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingRoles.has(user.id) && (
                        <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

