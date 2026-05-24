import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-8 text-center",
        className
      )}
    >
      {/* Icon illustration */}
      <div className="w-16 h-16 rounded-2xl bg-[#EEF1FA] flex items-center justify-center">
        <Icon size={32} className="text-[#4361EE]" />
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">{title}</h3>
        {description && (
          <p className="text-xs text-[#6E6E6E] leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
