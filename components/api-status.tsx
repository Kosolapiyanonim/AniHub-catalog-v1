'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CircleCheck, CircleX, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function ApiStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Проверка статуса API...')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/test')
        if (response.ok) {
          setStatus('success')
          setMessage('API работает корректно.')
        } else {
          setStatus('error')
          setMessage('Ошибка API: Не удалось подключиться.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Ошибка API: Сетевая проблема.')
        console.error('API status check failed:', error)
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  let icon
  let colorClass
  switch (status) {
    case 'loading':
      icon = <Loader2 className="h-4 w-4 animate-spin" />
      colorClass = 'text-blue-500'
      break
    case 'success':
      icon = <CircleCheck className="h-4 w-4" />
      colorClass = 'text-green-500'
      break
    case 'error':
      icon = <CircleX className="h-4 w-4" />
      colorClass = 'text-red-500'
      break
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className={`h-9 w-9 ${colorClass}`}>
            {icon}
            <span className="sr-only">{message}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
