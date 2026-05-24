"use client"

import { Bell, Search, Globe, User, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const roleLabel: Record<string, string> = {
  student:      "Сурагч",
  counselor:    "Зөвлөх багш",
  teacher:      "Багш",
  admin:        "School Admin",
  "super-admin":"Super Admin",
}

interface AppTopbarProps {
  title: string
  breadcrumb?: string[]
  dark?: boolean
}

export function AppTopbar({ title, breadcrumb, dark }: AppTopbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const userName    = user?.name  ?? "Хэрэглэгч"
  const userRole    = roleLabel[user?.role ?? ""] ?? ""
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U"
  const [lang, setLang] = useState<"mn" | "en">("mn")
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className={cn(
      "h-16 flex items-center px-6 border-b sticky top-0 z-30",
      dark ? "bg-[#1E2540] border-[#2C3655]" : "bg-white border-[#E2E8F0]"
    )}>
      {/* Left: title + breadcrumb */}
      <div className="flex-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 mb-0.5">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className={cn("text-xs", dark ? "text-[#8B9CC0]" : "text-[#64748B]")}>
                {crumb}{i < breadcrumb.length - 1 && <span className="ml-1.5">/</span>}
              </span>
            ))}
          </div>
        )}
        <h1 className={cn("text-lg font-semibold truncate leading-tight", dark ? "text-white" : "text-[#0F172A]")}>
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Search */}
        <div className={cn(
          "hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border text-sm w-48",
          dark ? "bg-[#2C3655] border-[#3D4E70] text-[#8B9CC0]" : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
        )}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">Хайх...</span>
        </div>

        {/* Lang toggle */}
        <button
          onClick={() => setLang(l => l === "mn" ? "en" : "mn")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
            dark ? "bg-[#2C3655] border-[#3D4E70] text-[#A0AECB] hover:bg-[#3D4E70]" : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#E2E8F0]"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "mn" ? "МН" : "EN"}
        </button>

        {/* Notification bell */}
        <button className={cn(
          "relative p-2 rounded-lg border transition-colors",
          dark ? "bg-[#2C3655] border-[#3D4E70] text-[#A0AECB] hover:bg-[#3D4E70]" : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#E2E8F0]"
        )}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E8A5A5]" />
        </button>

        {/* Avatar + profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="w-9 h-9 rounded-full bg-[#4361EE] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <span className="text-white text-sm font-semibold">{userInitial}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden">
              {/* Profile header */}
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">{userInitial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{userName}</p>
                    <p className="text-xs text-[#64748B] truncate">{userRole}</p>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                  <User className="w-4 h-4 text-[#3451D1]" />
                  Профайл засах
                </button>
                <div className="mx-3 my-1 h-px bg-[#E2E8F0]" />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#D97B6C] hover:bg-[#FFF0EE] transition-colors"
                  onClick={async () => { setProfileOpen(false); await logout(); router.push("/login") }}
                >
                  <LogOut className="w-4 h-4" />
                  Гарах
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
