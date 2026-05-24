"use client"

import { Search, Bell, ChevronDown, ChevronRight, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface Breadcrumb {
  label: string
  href?: string
}

interface TopBarProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  notificationCount?: number
  userName?: string
  avatarInitials?: string
  lang?: "MN" | "EN"
}

export function TopBar({
  title,
  breadcrumbs,
  notificationCount = 0,
  userName = "Б. Нарантуяа",
  avatarInitials = "БН",
  lang = "MN",
}: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
      {/* Left: title + breadcrumb */}
      <div className="flex flex-col justify-center gap-0.5">
        <h1 className="text-base font-semibold text-[#1A1A1A] leading-tight">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} className="text-[#9E9E9E]" />}
                <span
                  className={cn(
                    "text-xs",
                    i === breadcrumbs.length - 1
                      ? "text-[#4A4A4A] font-medium"
                      : "text-[#9E9E9E]"
                  )}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#4A4A4A] transition-colors">
          <Search size={18} />
          <span className="sr-only">Хайх</span>
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#4A4A4A] transition-colors">
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#D97B6C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Мэдэгдэл</span>
        </button>

        {/* Language toggle */}
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg hover:bg-[#F8FAFC] text-[#4A4A4A] transition-colors border border-[#E2E8F0]">
          <Globe size={14} />
          <span className="text-xs font-medium">{lang}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#E2E8F0] mx-1" />

        {/* User */}
        <button className="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {avatarInitials}
          </div>
          <span className="text-sm font-medium text-[#1A1A1A] hidden sm:block">{userName}</span>
          <ChevronDown size={14} className="text-[#9E9E9E]" />
        </button>
      </div>
    </header>
  )
}
