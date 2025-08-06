import type React from "react";
import Link from "next/link";
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  href?: string;
  children?: React.ReactNode;
}

export function HeroSection({
  title,
  description,
  href,
  children,
  className,
  ...props
}: HeroSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {href && (
          <Button variant="link" asChild className="px-0">
            <Link href={href} className="flex items-center gap-1">
              Смотреть все
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
