"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import { StatusBadge } from "@/components/status-badge"
import {
  Search, ChevronDown, MessageSquare,
  ClipboardList, MoreHorizontal, AlertTriangle, UserPlus, TrendingUp
} from "lucide-react"

interface Student {
  id: string; name: string; email: string; grade?: string
  gpa?: number; sat?: number; status: "active" | "inactive"
  tasksDone: number; tasksTotal: number; overdue: number; progress: number
}

interface Task {
  id: string; studentId: string; status: string; progress: number
}

const gradeOptions = ["Бүгд", "12-р анги", "11-р анги", "10-р анги"]
const progressOptions = ["Бүгд", "0–30%", "31–60%", "61–100%"]
const activeOptions = ["Бүгд", "Өнөөдөр", "7 хоногт", "Идэвхгүй"]

function ProgressRing({ pct }: { pct: number }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative w-[52px] h-[52px]">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90 absolute inset-0">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle cx="26" cy="26" r={r} fill="none" stroke="#4361EE" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function CounselorStudentsPage() {
  const [rawStudents, setRawStudents] = useState<Omit<Student, "tasksDone"|"tasksTotal"|"overdue"|"progress">[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState("")
  const [grade, setGrade] = useState("Бүгд")
  const [progressFilter, setProgressFilter] = useState("Бүгд")
  const [activeFilter, setActiveFilter] = useState("Бүгд")

  useEffect(() => {
    Promise.all([
      fetch("/api/users?role=student").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
    ]).then(([ud, td]) => {
      setRawStudents(ud.users ?? [])
      setTasks(td.tasks ?? [])
    }).catch(console.error)
  }, [])

  const students = useMemo<Student[]>(() => rawStudents.map(s => {
    const st = tasks.filter(t => t.studentId === s.id)
    const done = st.filter(t => t.status === "done").length
    const overdue = st.filter(t => t.status === "overdue").length
    const progress = st.length > 0 ? Math.round(st.reduce((a, t) => a + t.progress, 0) / st.length) : 0
    return { ...s, tasksDone: done, tasksTotal: st.length, overdue, progress }
  }), [rawStudents, tasks])

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchGrade = grade === "Бүгд" || s.grade === grade
    const matchActive = activeFilter === "Бүгд" || (activeFilter === "Идэвхгүй" && s.status === "inactive")
    const matchProgress = progressFilter === "Бүгд" ||
      (progressFilter === "0–30%" && s.progress <= 30) ||
      (progressFilter === "31–60%" && s.progress > 30 && s.progress <= 60) ||
      (progressFilter === "61–100%" && s.progress > 60)
    return matchSearch && matchGrade && matchActive && matchProgress
  })

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Миний сурагчид" breadcrumb={["Counselor"]} />

      <div className="flex-1 p-6 space-y-5">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input
                type="text"
                placeholder="Нэрээр хайх..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full"
              />
            </div>

            {/* Grade filter */}
            <div className="relative">
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm text-[#0F172A] outline-none cursor-pointer"
              >
                {gradeOptions.map(g => <option key={g}>{g}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
            </div>

            {/* Progress filter */}
            <div className="relative">
              <select
                value={progressFilter}
                onChange={e => setProgressFilter(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm text-[#0F172A] outline-none cursor-pointer"
              >
                {progressOptions.map(p => <option key={p}>{p}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
            </div>

            {/* Last active filter */}
            <div className="relative">
              <select
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value)}
                className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm text-[#0F172A] outline-none cursor-pointer"
              >
                {activeOptions.map(a => <option key={a}>{a}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[#64748B]">{filtered.length} сурагч</span>
              <button className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#8FA3D8] transition-colors">
                <UserPlus className="w-4 h-4" />
                Нэмэх
              </button>
            </div>
          </div>
        </div>

        {/* Student cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E2E8F0] card-shadow hover:border-[#4361EE] transition-all group">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Progress ring with avatar */}
                  <div className="relative flex-shrink-0">
                    <ProgressRing pct={s.progress} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{s.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full px-1 border border-[#E2E8F0]">
                      <span className="text-[9px] font-bold text-[#3451D1]">{s.progress}%</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0F172A] text-sm">{s.name}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{s.grade}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={s.status} />
                        <button className="p-1 rounded hover:bg-[#F8FAFC] transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-[#64748B]" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 truncate">{s.email}</p>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-[#F8FAFC] rounded-lg p-2">
                    <p className="text-sm font-bold text-[#0F172A]">{s.gpa}</p>
                    <p className="text-[10px] text-[#64748B]">GPA</p>
                  </div>
                  <div className="text-center bg-[#F8FAFC] rounded-lg p-2">
                    <p className="text-sm font-bold text-[#0F172A]">{s.sat}</p>
                    <p className="text-[10px] text-[#64748B]">SAT</p>
                  </div>
                  <div className="text-center bg-[#F8FAFC] rounded-lg p-2">
                    <p className="text-sm font-bold text-[#0F172A]">{s.tasksDone}/{s.tasksTotal}</p>
                    <p className="text-[10px] text-[#64748B]">Даалгавар</p>
                  </div>
                </div>

                {/* Overdue warning */}
                {s.overdue > 0 && (
                  <div className="flex items-center gap-2 bg-[#F7DDDD] rounded-lg px-3 py-2 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C0504D]" />
                    <span className="text-xs text-[#C0504D] font-medium">{s.overdue} хэтэрсэн даалгавар байна</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#64748B]">{s.grade ?? "—"}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/counselor/students/${s.id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#3451D1] hover:text-[#4A67A8] px-2.5 py-1.5 rounded-lg hover:bg-[#EEF1FD] transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Дэлгэрэнгүй
                    </Link>
                    <Link
                      href="/counselor/chat"
                      className="flex items-center gap-1.5 text-xs font-medium text-[#4A8C4D] px-2.5 py-1.5 rounded-lg hover:bg-[#DFEDE0] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Чат
                    </Link>
                    <Link
                      href="/counselor/tasks"
                      className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Даалгавар
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
