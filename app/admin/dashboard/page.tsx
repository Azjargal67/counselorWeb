"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { AppTopbar } from "@/components/app-topbar"
import {
  ClipboardList, GraduationCap, TrendingUp,
  ChevronRight, AlertCircle, CheckCircle2,
  BarChart3, ArrowUpRight, UserCheck, Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string; name: string; email: string; role: string
  grade?: string; status: "active" | "inactive"
}
interface Task { id: string; status: string; progress: number }

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [today, setToday] = useState("")

  useEffect(() => {
    setToday(new Date().toLocaleDateString("mn-MN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
    ]).then(([ud, td]) => {
      setUsers(ud.users ?? [])
      setTasks(td.tasks ?? [])
    }).catch(console.error)
  }, [])

  const stats = useMemo(() => {
    const counselors  = users.filter(u => u.role === "counselor").length
    const students    = users.filter(u => u.role === "student").length
    const total       = tasks.length
    const done        = tasks.filter(t => t.status === "done").length
    const successRate = total > 0 ? Math.round((done / total) * 100) : 0
    return { counselors, students, total, successRate }
  }, [users, tasks])

  const tasksByStatus = useMemo(() => [
    { label: "Дуусаагүй",        count: tasks.filter(t => t.status === "todo").length,        color: "bg-[#C8C4BE]" },
    { label: "Хийж байна",       count: tasks.filter(t => t.status === "in-progress").length, color: "bg-[#4361EE]" },
    { label: "Дууссан",          count: tasks.filter(t => t.status === "done").length,        color: "bg-[#4A8C4D]" },
    { label: "Хугацаа хэтэрсэн", count: tasks.filter(t => t.status === "overdue").length,    color: "bg-[#C0504D]" },
  ], [tasks])

  const counselors       = useMemo(() => users.filter(u => u.role === "counselor"), [users])
  const recentStudents   = useMemo(() => users.filter(u => u.role === "student").slice(0, 5), [users])
  const overdueCount     = tasks.filter(t => t.status === "overdue").length
  const inactiveStudents = users.filter(u => u.role === "student" && u.status === "inactive")

  const statCards = [
    { label: "Нийт зөвлөх",    value: stats.counselors,         icon: UserCheck,     bg: "bg-[#4361EE]", iconBg: "bg-white/20", text: "text-white",    sub: "text-white/70" },
    { label: "Нийт сурагч",    value: stats.students,           icon: GraduationCap, bg: "bg-[#B8D8BA]", iconBg: "bg-white/40", text: "text-[#1B5E20]", sub: "text-[#2D6A30]/70" },
    { label: "Нийт даалгавар", value: stats.total,              icon: ClipboardList, bg: "bg-[#F5D76E]", iconBg: "bg-white/40", text: "text-[#5C4300]", sub: "text-[#7A5C00]/70" },
    { label: "Амжилтын хувь",  value: `${stats.successRate}%`, icon: TrendingUp,    bg: "bg-[#F4C2C2]", iconBg: "bg-white/40", text: "text-[#7B1C1C]", sub: "text-[#8B2020]/70" },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Удирдлагын самбар" />

      <div className="flex-1 p-6 space-y-6">

        {/* Welcome banner — soft lavender */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#EEF1FD] to-[#E0E7FF] overflow-hidden px-8 py-8">
          <div className="absolute right-0 top-0 h-full w-72 pointer-events-none">
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-44 h-44 rounded-full bg-[#4361EE]/10" />
            <div className="absolute top-4 right-28 w-16 h-16 rounded-full bg-[#4361EE]/12" />
            <div className="absolute bottom-4 right-2 w-24 h-24 rounded-full bg-[#7B8FEE]/10" />
          </div>
          <div className="relative z-10">
            <p className="text-[#3451D1] text-xs font-semibold mb-3 uppercase tracking-wide">{today}</p>
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2 leading-tight">
              Сайн байна уу, {user?.name ?? "Админ"}!
            </h2>
            <p className="text-[#64748B] text-sm">
              <span className="font-semibold text-[#4361EE]">{stats.counselors} зөвлөх</span>,{" "}
              <span className="font-semibold text-[#4A8C4D]">{stats.students} сурагч</span> · нийт{" "}
              <span className="font-semibold text-[#0F172A]">{stats.total} даалгавар</span>
            </p>
          </div>
        </div>

        {/* Colored stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className={cn("rounded-2xl p-5", s.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.iconBg)}>
                    <Icon className={cn("w-5 h-5", s.text)} />
                  </div>
                  <span className={cn("flex items-center gap-0.5 text-xs font-semibold", s.sub)}>
                    <ArrowUpRight className="w-3 h-3" />+2
                  </span>
                </div>
                <p className={cn("text-3xl font-bold leading-none mb-1.5", s.text)}>{s.value}</p>
                <p className={cn("text-xs font-medium", s.sub)}>{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Task breakdown + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-[#64748B]" />
              <h2 className="font-semibold text-sm text-[#0F172A]">Даалгаврын байдал</h2>
              <span className="ml-auto text-xs text-[#64748B]">Нийт {tasks.length}</span>
            </div>
            <div className="space-y-4">
              {tasksByStatus.map(t => (
                <div key={t.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#0F172A] font-medium">{t.label}</span>
                    <span className="text-[#64748B]">{t.count} / {tasks.length}</span>
                  </div>
                  <div className="h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", t.color)}
                      style={{ width: tasks.length ? `${(t.count / tasks.length) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#4361EE] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#0F172A]">{stats.successRate}%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Нийт дуусгалтын хувь</p>
                <p className="text-xs text-[#64748B]">{tasks.filter(t => t.status === "done").length} / {tasks.length} даалгавар</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-[#E8960A]" />
              <h2 className="font-semibold text-sm text-[#0F172A]">Анхааруулга</h2>
            </div>
            <div className="space-y-2">
              {overdueCount > 0 && (
                <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 bg-[#FCE8E8] text-[#C0504D]">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{overdueCount} даалгаврын хугацаа хэтэрсэн</span>
                </div>
              )}
              {inactiveStudents.length > 0 && (
                <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 bg-[#FFF3E0] text-[#E8960A]">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{inactiveStudents.map(s => s.name).join(", ")} идэвхгүй болсон</span>
                </div>
              )}
              {overdueCount === 0 && inactiveStudents.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-[#4A8C4D] px-1 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Одоогоор анхааруулга байхгүй</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users: counselors + students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Counselors */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#64748B]" />
                <h2 className="font-semibold text-sm text-[#0F172A]">Зөвлөхүүд</h2>
              </div>
              <Link href="/admin/users" className="text-xs text-[#3451D1] hover:underline flex items-center gap-0.5">
                Бүгд <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {counselors.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC]">
                  <div className="w-9 h-9 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{c.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate">{c.name}</p>
                    <p className="text-xs text-[#64748B] truncate">{c.email}</p>
                  </div>
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0",
                    c.status === "active" ? "bg-[#4A8C4D]" : "bg-[#C8C4BE]"
                  )} />
                </div>
              ))}
              {counselors.length === 0 && (
                <p className="text-xs text-[#64748B] text-center py-6">Зөвлөх байхгүй</p>
              )}
            </div>
          </div>

          {/* Recent students */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#64748B]" />
                <h2 className="font-semibold text-sm text-[#0F172A]">Сурагчид</h2>
              </div>
              <Link href="/admin/users?tab=student" className="text-xs text-[#3451D1] hover:underline flex items-center gap-0.5">
                Бүгд <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentStudents.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EEF1FD] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#3451D1] text-xs font-bold">{s.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0F172A] truncate">{s.name}</p>
                    <p className="text-xs text-[#64748B]">{s.grade ?? "—"}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                    s.status === "active" ? "bg-[#DFEDE0] text-[#4A8C4D]" : "bg-[#E2E8F0] text-[#64748B]"
                  )}>
                    {s.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>
              ))}
              {recentStudents.length === 0 && (
                <p className="text-xs text-[#64748B] text-center py-6">Сурагч байхгүй</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
