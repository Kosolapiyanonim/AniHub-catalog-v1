"use client"

import { toast } from "sonner"

interface ApiError {
  message: string
  status?: number
  code?: string
}

export function useApiError() {
  const handleError = (error: unknown, context?: string) => {
    let errorMessage = "Произошла неизвестная ошибка"
    
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as ApiError).message
    }

    // Логируем ошибку в консоль для разработки
    if (process.env.NODE_ENV === "development") {
      console.error(`API Error${context ? ` in ${context}` : ""}:`, error)
    }

    // Показываем пользователю понятное сообщение
    toast.error(errorMessage)
  }

  const handleNetworkError = () => {
    toast.error("Ошибка сети. Проверьте подключение к интернету.")
  }

  const handleAuthError = () => {
    toast.error("Необходимо войти в аккаунт для выполнения этого действия.")
  }

  const handleValidationError = (errors: Record<string, string[]>) => {
    const firstError = Object.values(errors)[0]?.[0]
    if (firstError) {
      toast.error(firstError)
    } else {
      toast.error("Неверные данные. Проверьте введенную информацию.")
    }
  }

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
  }
} 