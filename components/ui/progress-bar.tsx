// components/ui/progress-bar.tsx

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // от 0 до 100
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("absolute bottom-0 left-0 h-1 w-full bg-white/20", className)}>
      <div 
        className="h-full bg-purple-500 transition-all duration-300" 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
