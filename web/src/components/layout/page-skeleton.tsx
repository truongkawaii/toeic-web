/** Skeleton dùng làm fallback Suspense cho các trang đọc query URL. */
export function PageSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="container-app space-y-8" aria-busy="true" aria-label="Đang tải">
      <div className="skeleton h-48 rounded-[var(--radius-hero)] sm:h-56" />
      <div className="skeleton h-12 w-full max-w-md rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="skeleton h-44 rounded-[var(--radius-card)]" />
        ))}
      </div>
    </div>
  );
}
