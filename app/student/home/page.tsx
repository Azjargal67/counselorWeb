"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import { StatusBadge } from "@/components/status-badge"
import { CareerTestModal } from "@/components/career-test-modal"
import { useAuth } from "@/lib/auth-context"
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Calendar, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string; title: string; category: string; status: string
  deadline: string; progress: number
}

const categoryLabel: Record<string, string> = {
  essay: "Essay", cv: "CV", transcript: "Transcript",
  recommendation: "Recommendation", "test-prep": "Шалгалт бэлтгэл",
  interview: "Интервью", other: "Бусад",
}

export default function StudentHomePage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [today, setToday] = useState("")
  const [careerTestDone, setCareerTestDone] = useState<boolean | null>(null)
  const [hollandCode, setHollandCode] = useState("")
  const [showCareerTest, setShowCareerTest] = useState(false)

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
    fetch("/api/career-test")
      .then(r => r.json())
      .then(d => {
        setCareerTestDone(d.completed ?? false)
        if (d.result?.hollandCode) setHollandCode(d.result.hollandCode)
      })
      .catch(() => setCareerTestDone(false))
  }, [])

  const isCareerTestTask = (t: Task) =>
    t.category === "career-test" || t.title === "Мэргэжил сонголтын тест"

  const regularTasks = useMemo(() => tasks.filter(t => !isCareerTestTask(t)), [tasks])

  const stats = useMemo(() => {
    const total    = tasks.length
    const done     = tasks.filter(t => t.status === "done").length
    const overdue  = tasks.filter(t => t.status === "overdue").length
    const upcoming = tasks.filter(t => t.status === "in-progress" || t.status === "todo").length
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, overdue, upcoming, progress }
  }, [tasks])

  const todayTasks = useMemo(() =>
    regularTasks.filter(t => t.status !== "done").slice(0, 4),
  [regularTasks])

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    return regularTasks
      .filter(t => t.status !== "done")
      .map(t => {
        const daysLeft = Math.ceil((new Date(t.deadline).getTime() - now.getTime()) / 86400000)
        return { title: t.title, date: t.deadline?.split("T")[0], daysLeft, status: t.status }
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4)
  }, [regularTasks])

  const statCards = [
    { label: "Нийт даалгавар", value: stats.total,    icon: ClipboardList, bg: "bg-[#4361EE]", iconBg: "bg-white/20", text: "text-white",           sub: "text-white/70" },
    { label: "Дуусгасан",      value: stats.done,     icon: CheckCircle2,  bg: "bg-[#B8D8BA]", iconBg: "bg-white/40", text: "text-[#1B5E20]",        sub: "text-[#2D6A30]/70" },
    { label: "Ойртож буй",     value: stats.upcoming, icon: Clock,         bg: "bg-[#F5D76E]", iconBg: "bg-white/40", text: "text-[#5C4300]",        sub: "text-[#7A5C00]/70" },
    { label: "Хэтэрсэн",       value: stats.overdue,  icon: AlertCircle,   bg: "bg-[#F4C2C2]", iconBg: "bg-white/40", text: "text-[#7B1C1C]",        sub: "text-[#8B2020]/70" },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Нүүр" />

      <div className="flex-1 p-6 space-y-6">

        {/* Welcome banner — soft lavender, Pitch.io style */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#EEF1FD] to-[#E0E7FF] overflow-hidden px-8 py-8">
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 h-full w-72 pointer-events-none">
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-44 h-44 rounded-full bg-[#4361EE]/10" />
            <div className="absolute top-4 right-28 w-16 h-16 rounded-full bg-[#4361EE]/12" />
            <div className="absolute bottom-4 right-2 w-24 h-24 rounded-full bg-[#7B8FEE]/10" />
          </div>
          <div className="relative z-10 max-w-lg">
            <p className="text-[#3451D1] text-xs font-semibold mb-3 uppercase tracking-wide">{today}</p>
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2 leading-tight">
              Сайн байна уу, {user?.name ?? "..."}!
            </h2>
            <p className="text-[#64748B] text-sm">
              Өнөөдөр хийх{" "}
              <span className="font-semibold text-[#4361EE]">{stats.upcoming} даалгавар</span>{" "}
              байна. Амжилт хүсье!
            </p>
            <div className="flex items-center gap-3 mt-5">
              <div className="h-2 bg-[#4361EE]/15 rounded-full w-48">
                <div className="h-2 bg-[#4361EE] rounded-full transition-all" style={{ width: `${stats.progress}%` }} />
              </div>
              <span className="text-sm font-bold text-[#4361EE]">{stats.progress}%</span>
              <span className="text-xs text-[#64748B]">дуусгасан</span>
            </div>
          </div>
        </div>

        {/* Career test prompt — shown until test is completed */}
        {careerTestDone === false && (
          <button onClick={() => setShowCareerTest(true)}
            className="w-full flex items-center gap-4 bg-gradient-to-r from-[#F5F3FF] to-[#EEF1FD] border-2 border-[#7C3AED] rounded-2xl px-5 py-4 hover:shadow-md transition-all group text-left">
            <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F172A]">Даалгавар №1 — Мэргэжил сонголтын тест</p>
              <p className="text-xs text-[#64748B] mt-0.5">Дж. Холландын аргад үндэслэсэн тестээ өгч Holland кодоо тодорхойлоорой</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] flex-shrink-0">
              Тест өгөх <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        )}

        {careerTestDone === true && (
          <div className="flex items-center gap-4 bg-[#F5F3FF] border border-[#C4B5FD] rounded-2xl px-5 py-4">
            <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0F172A]">Мэргэжил сонголтын тест — дууссан</p>
              {hollandCode && (
                <p className="text-xs text-[#64748B] mt-0.5">
                  Таны Holland код: <span className="font-bold text-[#7C3AED]">{hollandCode}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => { setShowCareerTest(true) }}
              className="text-xs font-semibold text-[#7C3AED] hover:underline flex-shrink-0">
              Хариу харах
            </button>
          </div>
        )}

        {/* Colored stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => {
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

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's tasks */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Өнөөдрийн даалгавар</h3>
              <Link href="/student/tasks" className="text-xs text-[#3451D1] hover:underline flex items-center gap-1">
                Бүгдийг харах <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {todayTasks.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-[#64748B]">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-[#B8D8BA]" />
                  <p className="text-sm">Бүх даалгавар дуусгасан!</p>
                </div>
              ) : todayTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    task.status === "overdue" ? "bg-[#E8A5A5]" :
                    task.status === "in-progress" ? "bg-[#4361EE]" : "bg-[#E2E8F0]"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#64748B]">{categoryLabel[task.category] ?? task.category}</span>
                      <span className="text-[#E2E8F0]">·</span>
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{task.deadline?.split("T")[0]}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] card-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Ойртож буй deadline</h3>
              <Link href="/student/tasks" className="text-xs text-[#3451D1] hover:underline flex items-center gap-1">
                Бүгдийг харах <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">Ойрын deadline байхгүй</p>
              ) : upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    item.daysLeft <= 0  ? "bg-[#F4C2C2] text-[#7B1C1C]" :
                    item.daysLeft <= 10 ? "bg-[#F5D76E] text-[#5C4300]" :
                                         "bg-[#EEF1FD] text-[#3451D1]"
                  )}>
                    {item.daysLeft <= 0 ? "!" : `${item.daysLeft}өд`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{item.title}</p>
                    <p className="text-xs text-[#64748B]">{item.date}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <CareerTestModal
        isOpen={showCareerTest}
        viewResults={careerTestDone === true}
        onClose={() => setShowCareerTest(false)}
        onComplete={() => {
          setCareerTestDone(true)
          setShowCareerTest(false)
          // Refresh the Holland code from API after completing/retaking
          fetch("/api/career-test")
            .then(r => r.json())
            .then(d => { if (d.result?.hollandCode) setHollandCode(d.result.hollandCode) })
            .catch(() => {})
        }}
      />
    </div>
  )
}
