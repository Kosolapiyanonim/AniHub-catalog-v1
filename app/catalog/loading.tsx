import { LoadingSpinner } from '@/components/loading-spinner'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <LoadingSpinner />
    </div>
  )
}
