import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: string; up: boolean }
  className?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-[#3451D1]", iconBg = "bg-[#EEF1FD]", trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-5 card-shadow border border-[#E2E8F0]", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#64748B] font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A] leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-[#64748B] mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.up ? "text-[#4A8C4D]" : "text-[#C0504D]")}>
              {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-4", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  )
}
