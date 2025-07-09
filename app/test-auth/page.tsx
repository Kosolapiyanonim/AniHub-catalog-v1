import { TestAuth } from "@/components/test-auth"

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Тестирование аутентификации</h1>
          <p className="text-gray-400">Проверка работы системы входа и регистрации</p>
        </div>
        <TestAuth />
      </div>
    </div>
  )
}
