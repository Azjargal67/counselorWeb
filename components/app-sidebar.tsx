"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Home, ClipboardList, FolderOpen, GraduationCap, Sparkles,
  MessageSquare, BarChart2, Settings, Users, CalendarDays,
  Mail, FileText, LayoutDashboard, Trophy,
  CreditCard, Building2, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/auth-context"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const navByRole: Record<Role, NavItem[]> = {
  student: [
    { label: "Нүүр",             href: "/student/home",                icon: Home },
    { label: "Миний даалгавар",  href: "/student/tasks",               icon: ClipboardList, badge: 3 },
    { label: "Материал",         href: "/student/documents",           icon: FolderOpen },
    { label: "Сургууль",         href: "/student/schools",             icon: GraduationCap },
    { label: "AI зөвлөмж",       href: "/student/ai-recommendations",  icon: Sparkles },
    { label: "Тэнцэлт",          href: "/student/admissions",          icon: Trophy },
    { label: "Recommendation",   href: "/student/letters",             icon: FileText },
    { label: "Чат",              href: "/student/chat",                icon: MessageSquare, badge: 2 },
    { label: "Академик мэдээлэл",href: "/student/academic",            icon: BarChart2 },
    { label: "Тохиргоо",         href: "/student/settings",            icon: Settings },
  ],
  counselor: [
    { label: "Нүүр",              href: "/counselor/home",      icon: Home },
    { label: "Миний сурагчид",    href: "/counselor/students",  icon: Users },
    { label: "Тэнцэлт",           href: "/counselor/admissions",icon: Trophy },
    { label: "Даалгаврын менежмент", href: "/counselor/tasks",  icon: ClipboardList },
    { label: "Календар",          href: "/counselor/calendar",  icon: CalendarDays },
    { label: "Чат",               href: "/counselor/chat",      icon: MessageSquare, badge: 7 },
  ],
  teacher: [
    { label: "Нүүр",         href: "/teacher/home",     icon: Home },
    { label: "Ирсэн хүсэлт", href: "/teacher/requests", icon: Mail, badge: 4 },
    { label: "Бичсэн захидал",href: "/teacher/letters",  icon: FileText },
    { label: "Чат",           href: "/teacher/chat",     icon: MessageSquare },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Хэрэглэгч",  href: "/admin/users",     icon: Users },
    { label: "Тайлан",     href: "/admin/reports",   icon: BarChart2 },
  ],
  "super-admin": [
    { label: "Overview",    href: "/super-admin/overview", icon: LayoutDashboard },
    { label: "Сургуулиуд",  href: "/super-admin/schools",  icon: Building2 },
    { label: "Төлбөр",      href: "/super-admin/billing",  icon: CreditCard },
  ],
}

const roleLabel: Record<Role, string> = {
  student:      "Сурагч",
  counselor:    "Зөвлөх багш",
  teacher:      "Багш",
  admin:        "School Admin",
  "super-admin":"Super Admin",
}

interface AppSidebarProps {
  role: Role
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname()
  const router  = useRouter()
  const { user, logout } = useAuth()
  const items = navByRole[role]
  const dark  = role === "super-admin"

  return (
    <aside className={cn(
      "w-60 flex-shrink-0 h-screen flex flex-col border-r sticky top-0",
      dark ? "bg-[#1E2540] border-[#2C3655]" : "bg-white border-[#E2E8F0]"
    )}>

      {/* Logo — h-16 matches topbar */}
      <div className={cn(
        "h-16 flex items-center px-5 border-b flex-shrink-0",
        dark ? "border-[#2C3655]" : "border-[#E2E8F0]"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4361EE] flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className={cn("font-bold text-sm leading-tight", dark ? "text-white" : "text-[#0F172A]")}>
              EduCounsel
            </p>
            <p className={cn("text-[11px] truncate max-w-[120px]", dark ? "text-[#8B9CC0]" : "text-[#64748B]")}>
              {role === "admin" && user?.tenantName ? user.tenantName : roleLabel[role]}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? dark
                    ? "bg-[#4361EE] text-white"
                    : "bg-[#EEF1FD] text-[#3451D1]"
                  : dark
                  ? "text-[#A0AECB] hover:bg-[#2C3655] hover:text-white"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn(
                  "text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                  active
                    ? dark ? "bg-white/20 text-white" : "bg-[#4361EE] text-white"
                    : dark ? "bg-[#4361EE]/80 text-white" : "bg-[#EEF1FD] text-[#3451D1]"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user profile + logout */}
      <div className={cn("border-t px-3 py-3 flex-shrink-0", dark ? "border-[#2C3655]" : "border-[#E2E8F0]")}>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl",
          dark ? "bg-[#2C3655]" : "bg-[#F8FAFC]"
        )}>
          <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs font-semibold truncate leading-tight", dark ? "text-white" : "text-[#0F172A]")}>
              {user?.name ?? roleLabel[role]}
            </p>
            <p className={cn("text-[10px] truncate", dark ? "text-[#8B9CC0]" : "text-[#64748B]")}>
              {user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={async () => {
              await logout()
              router.push(dark ? "/platform/login" : "/login")
            }}
            title="Гарах"
            className={cn(
              "p-1.5 rounded-lg transition-colors flex-shrink-0",
              dark
                ? "text-[#8B9CC0] hover:text-white hover:bg-[#3D4E70]"
                : "text-[#64748B] hover:text-[#C0504D] hover:bg-[#F7DDDD]"
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
