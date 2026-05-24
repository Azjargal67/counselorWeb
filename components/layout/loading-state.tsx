import { cn } from "@/lib/utils"

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-[#E2E8F0] via-[#F5F2EE] to-[#E2E8F0] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]",
        className
      )}
    />
  )
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-4/5" />
      <Skeleton className="h-2.5 w-3/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

type SpinnerSize = "sm" | "md" | "lg"

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-[3px]",
  lg: "w-10 h-10 border-4",
}

export function Spinner({ size = "md" }: { size?: SpinnerSize }) {
  return (
    <div
      role="status"
      aria-label="Уншиж байна"
      className={cn(
        "rounded-full border-[#E2E8F0] border-t-[#4361EE] animate-spin",
        spinnerSizes[size]
      )}
    />
  )
}

// ─── Skeleton Cards row for DS showcase ───────────────────────────────────────

export function LoadingShowcase() {
  return (
    <div className="flex flex-col gap-6">
      {/* Skeleton cards */}
      <div>
        <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide mb-3">
          Скелетон карт (shimmer)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      {/* Spinners */}
      <div>
        <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide mb-3">
          Spinner (SM / MD / LG)
        </p>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span className="text-xs text-[#9E9E9E]">SM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="text-xs text-[#9E9E9E]">MD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-xs text-[#9E9E9E]">LG</span>
          </div>
        </div>
      </div>
    </div>
  )
}
