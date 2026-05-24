"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Users, ClipboardList, TrendingUp,
  AlertTriangle, ArrowRight, CheckCircle2, Clock,
  Plus,
} from "lucide-react"

interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "done" | "overdue"
  deadline: string
  studentId: string
  studentName?: string
  studentGrade?: string
  progress: number
  updatedAt: string
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} мин өмнө`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} цагийн өмнө`
  return `${Math.floor(h / 24)} өдрийн өмнө`
}

export default function CounselorHomePage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState("")

  useEffect(() => {
    setToday(new Date().toLocaleDateString("mn-MN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }))
  }, [])

  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.json())
      .then(d => setTasks(d.tasks ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const students = new Set(tasks.map(t => t.studentId)).size
    const overdue  = tasks.filter(t => t.status === "overdue").length
    const weekAgo  = Date.now() - 7 * 86400000
    const weekly   = tasks.filter(t => new Date(t.updatedAt).getTime() > weekAgo).length
    return { students, tasks: tasks.length, overdue, weekly }
  }, [tasks])

  const overdueStudents = useMemo(() => {
    const map: Record<string, { id: string; name: string; grade: string; overdueCount: number; progress: number }> = {}
    tasks.filter(t => t.status === "overdue").forEach(t => {
      if (!map[t.studentId]) map[t.studentId] = { id: t.studentId, name: t.studentName ?? "—", grade: t.studentGrade ?? "—", overdueCount: 0, progress: t.progress }
      map[t.studentId].overdueCount++
    })
    return Object.values(map).slice(0, 4)
  }, [tasks])

  const upcomingDeadlines = useMemo(() =>
    tasks
      .filter(t => t.status !== "done" && daysUntil(t.deadline) >= 0)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 4)
      .map(t => ({
        title: `${t.studentName ?? "—"} — ${t.title}`,
        date: t.deadline.split("T")[0],
        daysLeft: daysUntil(t.deadline),
      }))
  , [tasks])

  const recentActivity = useMemo(() =>
    [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map(t => ({
        id: t.id,
        student: t.studentName ?? "—",
        text: t.status === "done"
          ? `"${t.title}" даалгаврыг дуусгав`
          : t.status === "overdue"
          ? `"${t.title}" даалгавар хэтэрсэн`
          : `"${t.title}" даалгавар шинэчлэгдсэн`,
        time: timeAgo(t.updatedAt),
        icon: t.status === "done" ? CheckCircle2 : t.status === "overdue" ? AlertTriangle : Clock,
        color: t.status === "done" ? "text-[#4A8C4D]" : t.status === "overdue" ? "text-[#C0504D]" : "text-[#3451D1]",
        dot: t.status === "done" ? "bg-[#B8D8BA]" : t.status === "overdue" ? "bg-[#F4C2C2]" : "bg-[#EEF1FD]",
      }))
  , [tasks])

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Нүүр" />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome banner — soft lavender, Pitch.io style */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#EEF1FD] to-[#E0E7FF] overflow-hidden px-8 py-8">
          <div className="absolute right-0 top-0 h-full w-72 pointer-events-none">
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-44 h-44 rounded-full bg-[#4361EE]/10" />
            <div className="absolute top-4 right-28 w-16 h-16 rounded-full bg-[#4361EE]/12" />
            <div className="absolute bottom-4 right-2 w-24 h-24 rounded-full bg-[#7B8FEE]/10" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="max-w-lg">
              <p className="text-[#3451D1] text-xs font-semibold mb-3 uppercase tracking-wide">
                {today}
              </p>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-2 leading-tight">
                Сайн байна уу, {user?.name ?? "багш"}!
              </h2>
              <p className="text-[#64748B] text-sm">
                Та <span className="font-semibold text-[#4361EE]">{stats.students} сурагч</span>-тай ажиллаж байна.
                {stats.overdue > 0 && (
                  <> · <span className="font-semibold text-[#C0504D]">{stats.overdue} хэтэрсэн даалгавар</span></>
                )}
              </p>
            </div>
            <Link
              href="/counselor/tasks"
              className="flex items-center gap-2 bg-[#4361EE] hover:bg-[#3451D1] transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex-shrink-0 mt-1"
            >
              <Plus className="w-4 h-4" />
              Даалгавар нэмэх
            </Link>
          </div>
        </div>

        {/* Colored stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Нийт сурагч",    value: stats.students, icon: Users,        bg: "bg-[#4361EE]", iconBg: "bg-white/20", text: "text-white",    sub: "text-white/70" },
            { label: "Нийт даалгавар", value: stats.tasks,    icon: ClipboardList, bg: "bg-[#B8D8BA]", iconBg: "bg-white/40", text: "text-[#1B5E20]", sub: "text-[#2D6A30]/70" },
            { label: "Хэтэрсэн",       value: stats.overdue,  icon: AlertTriangle, bg: "bg-[#F4C2C2]", iconBg: "bg-white/40", text: "text-[#7B1C1C]", sub: "text-[#8B2020]/70" },
            { label: "7 хоногт",       value: stats.weekly,   icon: TrendingUp,    bg: "bg-[#F5D76E]", iconBg: "bg-white/40", text: "text-[#5C4300]", sub: "text-[#7A5C00]/70" },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className={cn("rounded-2xl p-5", s.bg)}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.iconBg)}>
                  <Icon className={cn("w-5 h-5", s.text)} />
                </div>
                <p className={cn("text-3xl font-bold leading-none mb-1.5", s.text)}>{s.value}</p>
                <p className={cn("text-xs font-medium", s.sub)}>{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Alert + Deadlines row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue alert */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F7DDDD] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#C0504D]" />
                </div>
                <h3 className="font-semibold text-[#0F172A]">Анхаарал шаардсан</h3>
                <span className="text-xs bg-[#F7DDDD] text-[#C0504D] px-2 py-0.5 rounded-full font-semibold">
                  {overdueStudents.length}
                </span>
              </div>
              <Link href="/counselor/students" className="text-xs text-[#3451D1] hover:underline flex items-center gap-1">
                Бүгдийг харах <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="p-8 text-center text-sm text-[#64748B]">Уншиж байна...</div>
            ) : overdueStudents.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#64748B]">Хэтэрсэн даалгавар байхгүй байна</div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {overdueStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#F4C2C2] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C0504D] text-sm font-semibold">{s.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{s.name}</p>
                      <p className="text-xs text-[#64748B]">{s.grade}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-semibold text-[#C0504D]">{s.overdueCount} хэтэрсэн</span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-full">
                          <div className="h-1.5 bg-[#4361EE] rounded-full" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs text-[#64748B]">{s.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EEF1FD] flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#3451D1]" />
                </div>
                <h3 className="font-semibold text-[#0F172A]">Ойртож буй deadline</h3>
              </div>
              <Link href="/counselor/calendar" className="text-xs text-[#3451D1] hover:underline flex items-center gap-1">
                Календар <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <p className="text-sm text-[#64748B] text-center py-4">Уншиж байна...</p>
              ) : upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">Ойрын deadline байхгүй</p>
              ) : upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-center ${
                    item.daysLeft <= 10 ? "bg-[#F7DDDD]" : item.daysLeft <= 20 ? "bg-[#FDF4D9]" : "bg-[#EEF1FD]"
                  }`}>
                    <span className={`text-sm font-bold leading-none ${
                      item.daysLeft <= 10 ? "text-[#C0504D]" : item.daysLeft <= 20 ? "text-[#B8860B]" : "text-[#3451D1]"
                    }`}>{item.daysLeft}</span>
                    <span className={`text-[10px] ${
                      item.daysLeft <= 10 ? "text-[#C0504D]" : item.daysLeft <= 20 ? "text-[#B8860B]" : "text-[#3451D1]"
                    }`}>өдөр</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{item.title}</p>
                    <p className="text-xs text-[#64748B]">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity timeline */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow">
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Сүүлийн үйлдэл</h3>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-[#64748B] text-center py-4">Уншиж байна...</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#E2E8F0]" />
                <div className="space-y-5">
                  {recentActivity.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className="flex items-start gap-4 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${item.dot}`}>
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-[#0F172A]">
                            <span className="font-semibold">{item.student}</span>
                            {" — "}{item.text}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
