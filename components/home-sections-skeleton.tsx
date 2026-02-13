export function HomeSectionsSkeleton() {
  return (
    <div className="space-y-12" aria-hidden="true">
      {[1, 2].map((section) => (
        <section key={section} className="space-y-4">
          <div className="h-7 w-48 rounded-md bg-muted/60 animate-pulse" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`${section}-${index}`} className="aspect-[2/3] rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
