"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "AniHub",
    siteDescription: "Смотри аниме онлайн бесплатно",
    imageProxyEnabled: true,
    imageProxyUrl: "/api/images/proxy",
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement settings API
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success("Настройки сохранены")
    } catch (err) {
      toast.error("Не удалось сохранить настройки")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Настройки сайта</h1>
        <p className="text-slate-400">Управление общими настройками сайта</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Общие настройки</CardTitle>
          <CardDescription>Основные параметры сайта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="siteName" className="text-slate-300">
              Название сайта
            </Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="bg-slate-900 border-slate-700 mt-1"
            />
          </div>

          <div>
            <Label htmlFor="siteDescription" className="text-slate-300">
              Описание сайта
            </Label>
            <Input
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="bg-slate-900 border-slate-700 mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Настройки изображений</CardTitle>
          <CardDescription>Управление прокси и CDN для изображений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageProxyUrl" className="text-slate-300">
              URL прокси изображений
            </Label>
            <Input
              id="imageProxyUrl"
              value={settings.imageProxyUrl}
              onChange={(e) => setSettings({ ...settings, imageProxyUrl: e.target.value })}
              className="bg-slate-900 border-slate-700 mt-1"
              placeholder="/api/images/proxy"
            />
            <p className="text-xs text-slate-500 mt-1">
              Эндпоинт для проксирования внешних изображений
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </div>
    </div>
  )
}





