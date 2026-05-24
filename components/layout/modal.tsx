"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ModalSize = "sm" | "md" | "lg"

interface ModalProps {
  title: string
  size?: ModalSize
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
  footer?: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]",
  lg: "max-w-[720px]",
}

export function Modal({
  title,
  size = "md",
  open = true,
  onClose,
  children,
  footer,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full bg-white rounded-xl shadow-xl flex flex-col",
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 id="modal-title" className="text-base font-semibold text-[#1A1A1A]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E9E9E] hover:bg-[#F8FAFC] hover:text-[#1A1A1A] transition-colors"
            aria-label="Хаах"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 text-sm text-[#4A4A4A] leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Static showcase variant (no state needed for DS page) ────────────────────

export function ModalShowcase() {
  return (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as ModalSize[]).map((size) => (
        <div key={size} className="relative bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#E2E8F0]">
          {/* Faux overlay */}
          <div className="absolute inset-0 bg-black/10 rounded-xl" />
          <div className="relative p-6 flex justify-center">
            <div
              className={cn(
                "w-full bg-white rounded-xl shadow-lg flex flex-col",
                sizeClasses[size]
              )}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {size === "sm" && "Жижиг диалог — 480px"}
                  {size === "md" && "Дунд диалог — 640px"}
                  {size === "lg" && "Том диалог — 720px"}
                </h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9E9E9E] hover:bg-[#F8FAFC]">
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5 text-sm text-[#4A4A4A] leading-relaxed">
                Энд модалын үндсэн агуулга байрлана. Хэрэглэгчид шаардлагатай мэдээллийг энд харуулна.
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
                <button className="h-9 px-4 rounded-lg text-sm font-medium border border-[#E2E8F0] text-[#4A4A4A] hover:bg-[#F8FAFC] transition-colors">
                  Цуцлах
                </button>
                <button className="h-9 px-4 rounded-lg text-sm font-medium bg-[#4361EE] text-white hover:bg-[#8A9FD0] transition-colors">
                  Хадгалах
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
