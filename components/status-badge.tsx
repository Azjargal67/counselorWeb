import { cn } from "@/lib/utils"

type StatusType = "todo" | "in-progress" | "done" | "overdue" | "pending" | "active" | "inactive" | "expiring" | "writing" | "sent" | "rejected" | "accepted" | "waiting" | "researching" | "applied"

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  "todo": { label: "Хийгдээгүй", className: "bg-[#E2E8F0] text-[#64748B]" },
  "in-progress": { label: "Хийгдэж буй", className: "bg-[#EEF1FD] text-[#3451D1]" },
  "done": { label: "Дууссан", className: "bg-[#DFEDE0] text-[#4A8C4D]" },
  "overdue": { label: "Хэтэрсэн", className: "bg-[#F7DDDD] text-[#C0504D]" },
  "pending": { label: "Хүлээгдэж буй", className: "bg-[#FDF4D9] text-[#B8860B]" },
  "active": { label: "Идэвхтэй", className: "bg-[#DFEDE0] text-[#4A8C4D]" },
  "inactive": { label: "Идэвхгүй", className: "bg-[#E2E8F0] text-[#64748B]" },
  "expiring": { label: "Дуусах дөхсөн", className: "bg-[#FDF4D9] text-[#B8860B]" },
  "writing": { label: "Бичиж буй", className: "bg-[#EEF1FD] text-[#3451D1]" },
  "sent": { label: "Явуулсан", className: "bg-[#DFEDE0] text-[#4A8C4D]" },
  "rejected": { label: "Татгалзсан", className: "bg-[#F7DDDD] text-[#C0504D]" },
  "accepted": { label: "Тэнцсэн", className: "bg-[#DFEDE0] text-[#4A8C4D]" },
  "waiting": { label: "Хариу хүлээж буй", className: "bg-[#FDF4D9] text-[#B8860B]" },
  "researching": { label: "Судалж буй", className: "bg-[#EEF1FD] text-[#3451D1]" },
  "applied": { label: "Илгээсэн", className: "bg-[#FDF4D9] text-[#B8860B]" },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status as StatusType] ?? { label: status, className: "bg-[#E2E8F0] text-[#64748B]" }
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  )
}
