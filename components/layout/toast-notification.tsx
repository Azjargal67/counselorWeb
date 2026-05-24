"use client"

import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "success" | "info" | "warning" | "error"

interface ToastNotificationProps {
  variant: ToastVariant
  title: string
  message: string
  onClose?: () => void
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ElementType
    iconColor: string
    borderColor: string
    bgColor: string
    label: string
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-[#4CA96D]",
    borderColor: "border-l-[#4CA96D]",
    bgColor: "bg-white",
    label: "Амжилттай",
  },
  info: {
    icon: Info,
    iconColor: "text-[#5B8FD4]",
    borderColor: "border-l-[#5B8FD4]",
    bgColor: "bg-white",
    label: "Мэдээлэл",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-[#D4A043]",
    borderColor: "border-l-[#D4A043]",
    bgColor: "bg-white",
    label: "Анхааруулга",
  },
  error: {
    icon: XCircle,
    iconColor: "text-[#D97B6C]",
    borderColor: "border-l-[#D97B6C]",
    bgColor: "bg-white",
    label: "Алдаа",
  },
}

export function ToastNotification({
  variant,
  title,
  message,
  onClose,
}: ToastNotificationProps) {
  const { icon: Icon, iconColor, borderColor, bgColor } = variantConfig[variant]

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "w-[360px] flex items-start gap-3 p-4 rounded-xl shadow-lg border border-[#E2E8F0] border-l-4",
        bgColor,
        borderColor
      )}
    >
      <Icon size={20} className={cn("shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
        <p className="text-xs text-[#6E6E6E] mt-0.5 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-[#9E9E9E] hover:text-[#4A4A4A] transition-colors"
        aria-label="Хаах"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── All 4 variants for DS showcase ───────────────────────────────────────────

export function ToastShowcase() {
  const variants: ToastVariant[] = ["success", "info", "warning", "error"]
  const config: Record<ToastVariant, { title: string; message: string }> = {
    success: {
      title: "Амжилттай хадгалагдлаа",
      message: "Таны мэдээлэл системд амжилттай хадгалагдлаа.",
    },
    info: {
      title: "Шинэ мэдэгдэл",
      message: "Таны өргөдлийг хянаж байна. Удахгүй мэдэгдэнэ.",
    },
    warning: {
      title: "Анхаарал шаардлагатай",
      message: "Таны профайл мэдээлэл бүрэн биш байна.",
    },
    error: {
      title: "Алдаа гарлаа",
      message: "Холболт тасарлаа. Дахин оролдоно уу.",
    },
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.map((v) => (
        <ToastNotification
          key={v}
          variant={v}
          title={config[v].title}
          message={config[v].message}
        />
      ))}
    </div>
  )
}
