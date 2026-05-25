"use client"

import { Bell, Search, Globe, User, LogOut, ClipboardList, MessageSquare, Trophy, FileText } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Notif {
  id: string
  type: "task" | "recommendation" | "chat" | "admission"
  title: string
  message: string
  read: boolean
  link: string
  createdAt: string
}

const notifIcon: Record<string, React.ElementType> = {
  task: ClipboardList,
  recommendation: FileText,
  chat: MessageSquare,
  admission: Trophy,
}
const notifColor: Record<string, string> = {
  task: "bg-[#EEF1FD] text-[#4361EE]",
  recommendation: "bg-[#DFEDE0] text-[#4A8C4D]",
  chat: "bg-[#FFF3E0] text-[#F59E0B]",
  admission: "bg-[#FDE8E8] text-[#E53E3E]",
}

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
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnread(data.unread ?? 0)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  const handleNotifOpen = async () => {
    setNotifOpen(o => !o)
    setProfileOpen(false)
    if (!notifOpen && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" })
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
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
        <div ref={notifRef} className="relative">
          <button onClick={handleNotifOpen} className={cn(
            "relative p-2 rounded-lg border transition-colors",
            dark ? "bg-[#2C3655] border-[#3D4E70] text-[#A0AECB] hover:bg-[#3D4E70]" : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#E2E8F0]"
          )}>
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E53E3E] text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0F172A]">Мэдэгдэл</p>
                {notifications.length > 0 && (
                  <span className="text-xs text-[#64748B]">{notifications.length} мэдэгдэл</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#64748B]">Мэдэгдэл байхгүй</div>
                ) : notifications.map(n => {
                  const Icon = notifIcon[n.type] ?? Bell
                  return (
                    <button key={n.id} onClick={() => { setNotifOpen(false); router.push(n.link || "/") }}
                      className={cn("w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors text-left border-b border-[#E2E8F0] last:border-0", !n.read && "bg-[#F8FAFF]")}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", notifColor[n.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A]">{n.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">
                          {new Date(n.createdAt).toLocaleString("mn-MN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#4361EE] flex-shrink-0 mt-2" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

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
