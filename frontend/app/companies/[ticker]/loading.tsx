function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-zinc-800 rounded animate-pulse ${className}`} />
}

function MetricCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="h-3 w-16" />
    </div>
  )
}

export default function CompanyLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <SkeletonBlock className="h-4 w-28" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-64" />
            <SkeletonBlock className="h-7 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-3 w-24" />
        </div>

        {/* Metrics */}
        <section className="space-y-3">
          <SkeletonBlock className="h-5 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
          <SkeletonBlock className="h-64 w-full" />
        </div>

        {/* Filings */}
        <section className="space-y-3">
          <SkeletonBlock className="h-5 w-36" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800/50 last:border-b-0">
                <SkeletonBlock className="h-5 w-14 rounded-full" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-24 hidden sm:block" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
