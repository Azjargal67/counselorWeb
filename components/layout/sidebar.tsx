"use client"

import {
  Home,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Sparkles,
  MessageCircle,
  BarChart2,
  Settings,
  Users,
  CalendarDays,
  Bell,
  LayoutDashboard,
  FileText,
  Mail,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
}

type SidebarRole = "student" | "counselor" | "teacher" | "admin"

interface SidebarProps {
  role: SidebarRole
  userName?: string
  userRole?: string
  avatarInitials?: string
}

// ─── Nav configs per role ──────────────────────────────────────────────────────

const navConfigs: Record<SidebarRole, NavItem[]> = {
  student: [
    { icon: Home, label: "Нүүр", active: true },
    { icon: ClipboardList, label: "Даалгавар" },
    { icon: FolderOpen, label: "Материал" },
    { icon: GraduationCap, label: "Сургууль" },
    { icon: Sparkles, label: "AI зөвлөмж" },
    { icon: MessageCircle, label: "Чат", badge: 3 },
    { icon: BarChart2, label: "Академик" },
    { icon: Settings, label: "Тохиргоо" },
  ],
  counselor: [
    { icon: Home, label: "Нүүр", active: true },
    { icon: Users, label: "Сурагчид" },
    { icon: ClipboardList, label: "Даалгавар" },
    { icon: CalendarDays, label: "Хуанли" },
    { icon: MessageCircle, label: "Чат" },
    { icon: FolderOpen, label: "Загвар" },
    { icon: Bell, label: "Мэдэгдэл" },
    { icon: Settings, label: "Тохиргоо" },
  ],
  teacher: [
    { icon: Home, label: "Нүүр", active: true },
    { icon: Mail, label: "Хүсэлт", badge: 4 },
    { icon: FileText, label: "Захидал" },
    { icon: ClipboardList, label: "Загвар" },
    { icon: Settings, label: "Тохиргоо" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Хяналтын самбар", active: true },
    { icon: Users, label: "Хэрэглэгч" },
    { icon: BarChart2, label: "Тайлан" },
    { icon: GraduationCap, label: "Сурагчид" },
    { icon: Settings, label: "Тохиргоо" },
  ],
}

const roleLabels: Record<SidebarRole, string> = {
  student: "Сурагч",
  counselor: "Зөвлөх",
  teacher: "Багш",
  admin: "Админ",
}

const roleBadgeColors: Record<SidebarRole, string> = {
  student: "bg-[#C8D8F0] text-[#3A5B8C]",
  counselor: "bg-[#C8E6D4] text-[#2E6E4E]",
  teacher: "bg-[#F5DEB3] text-[#7A5C1E]",
  admin: "bg-[#E0D4F0] text-[#5B3A8C]",
}

// ─── NavItem sub-component ─────────────────────────────────────────────────────

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <li>
      <button
        className={cn(
          "w-full flex items-center gap-3 px-4 h-12 rounded-lg text-sm font-medium transition-colors",
          item.active
            ? "bg-[#4361EE] text-white"
            : "text-[#4A4A4A] hover:bg-[#F8FAFC]"
        )}
      >
        <Icon size={20} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {item.badge != null && (
          <span
            className={cn(
              "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
              item.active ? "bg-white text-[#4361EE]" : "bg-[#4361EE] text-white"
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    </li>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  role,
  userName = "Б. Нарантуяа",
  userRole,
  avatarInitials = "БН",
}: SidebarProps) {
  const items = navConfigs[role]
  const displayRole = userRole ?? roleLabels[role]
  const badgeColor = roleBadgeColors[role]

  return (
    <aside className="w-60 h-full bg-white border-r border-[#E2E8F0] flex flex-col shrink-0">
      {/* Logo area */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-[#E2E8F0]">
        <div className="w-9 h-9 rounded-xl bg-[#4361EE] flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <span className="text-base font-semibold text-[#1A1A1A] tracking-tight">
          EduCounsel
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavRow key={item.label} item={item} />
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#E2E8F0] px-3 py-4 flex flex-col gap-2">
        {/* Profile row */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1A1A1A] truncate">{userName}</p>
            <span
              className={cn(
                "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                badgeColor
              )}
            >
              {displayRole}
            </span>
          </div>
          <ChevronRight size={14} className="text-[#9E9E9E] shrink-0" />
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1 px-1">
          <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs text-[#4A4A4A] hover:bg-[#F8FAFC] transition-colors">
            <Settings size={15} />
            <span>Тохиргоо</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs text-[#D97B6C] hover:bg-[#FFF0EE] transition-colors">
            <LogOut size={15} />
            <span>Гарах</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
