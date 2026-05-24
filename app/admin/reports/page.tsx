"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  BarChart3, TrendingUp, Download,
  GraduationCap, ClipboardList, CheckCircle2, AlertCircle,
  Users, Building2, Trophy,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

const monthlyTasks = [
  { month: "9-р сар",  done: 42, overdue: 5  },
  { month: "10-р сар", done: 58, overdue: 3  },
  { month: "11-р сар", done: 75, overdue: 7  },
  { month: "12-р сар", done: 61, overdue: 4  },
  { month: "1-р сар",  done: 88, overdue: 6  },
  { month: "2-р сар",  done: 94, overdue: 2  },
  { month: "3-р сар",  done: 112, overdue: 8  },
  { month: "4-р сар",  done: 98, overdue: 3  },
]

const acceptanceData = [
  { school: "Олон улсын",  rate: 72 },
  { school: "АНУ",         rate: 58 },
  { school: "Их Британи", rate: 64 },
  { school: "Канад",       rate: 81 },
  { school: "Австрали",    rate: 88 },
  { school: "Солонгос",    rate: 75 },
]

const counselorPerf = [
  { name: "Мөнхзул Г.", students: 16, tasks: 48, done: 42, rate: 87 },
  { name: "Отгонбаяр Н.", students: 16, tasks: 42, done: 38, rate: 90 },
]

const CURRENCY_SYMBOL: Record<string, string> = { MNT: "₮", USD: "$", GBP: "£", AUD: "A$", KRW: "₩" }

interface ApiAdmission {
  id: string
  studentName?: string
  schoolName: string
  country: string
  status: string
  scholarshipPercent: number
  scholarshipAmount: number
  currency: string
}

interface ApiTask { status: string }
interface ApiUser { role: string }

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  accepted:   { label: "Тэнцсэн",     color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]" },
  rejected:   { label: "Татгалзсан",  color: "text-[#C0504D]", bg: "bg-[#FCE8E8]" },
  waitlisted: { label: "Хүлээлгэнд",  color: "text-[#B8860B]", bg: "bg-[#FDF4D9]" },
  deferred:   { label: "Хойшлогдсон", color: "text-[#3451D1]", bg: "bg-[#EEF1FD]" },
}

type Period = "month" | "quarter" | "year"

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>("month")
  const [admissions, setAdmissions] = useState<ApiAdmission[]>([])
  const [tasks, setTasks] = useState<ApiTask[]>([])
  const [users, setUsers] = useState<ApiUser[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/admissions").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
      fetch("/api/users").then(r => r.json()),
    ]).then(([ad, td, ud]) => {
      setAdmissions(ad.admissions ?? [])
      setTasks(td.tasks ?? [])
      setUsers(ud.users ?? [])
    })
  }, [])

  const studentCount = users.filter(u => u.role === "student").length
  const doneCount = tasks.filter(t => t.status === "done").length
  const overdueCount = tasks.filter(t => t.status === "overdue").length
  const successRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  const reportCards = [
    { label: "Нийт сурагч",      value: studentCount,       icon: GraduationCap, color: "bg-[#EEF1FD] text-[#3451D1]",  sub: "Идэвхтэй сурагч"       },
    { label: "Нийт даалгавар",   value: tasks.length,       icon: ClipboardList, color: "bg-[#FFF3E0] text-[#E8960A]",  sub: "Нийт"                   },
    { label: "Дуусгасан",        value: `${successRate}%`,  icon: CheckCircle2,  color: "bg-[#DFEDE0] text-[#4A8C4D]",  sub: "Амжилтын %"             },
    { label: "Хугацаа хэтэрсэн", value: overdueCount,       icon: AlertCircle,   color: "bg-[#FCE8E8] text-[#C0504D]",  sub: "Өнөөдрийн байдлаар"    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Тайлан ба аналитик" />

      <div className="flex-1 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5">
            {([["month", "Сар"], ["quarter", "Улирал"], ["year", "Жил"]] as [Period, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  period === key ? "bg-[#4361EE] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-[#3451D1] bg-[#EEF1FD] hover:bg-[#D4DCEF] px-4 py-2 rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Тайлан татах
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportCards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", c.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#0F172A] mb-0.5">{c.value}</p>
                <p className="text-xs font-medium text-[#0F172A] mb-0.5">{c.label}</p>
                <p className="text-xs text-[#64748B]">{c.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly task bar chart */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#64748B]" />
                <h2 className="font-semibold text-sm text-[#0F172A]">Сарын даалгавар гүйцэтгэл</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-[#4361EE] inline-block" /> Дуусгасан</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-[#F4C2C2] inline-block" /> Хэтэрсэн</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTasks} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar dataKey="done"    name="Дуусгасан"     fill="#4361EE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Хугацаа хэтэрсэн" fill="#F4C2C2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Acceptance rate by country */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#64748B]" />
              <h2 className="font-semibold text-sm text-[#0F172A]">Улс орноор хүлээн авалтын хувь</h2>
            </div>
            <div className="space-y-3">
              {acceptanceData.map(d => (
                <div key={d.school}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-[#64748B]" />
                      <span className="text-[#0F172A] font-medium">{d.school}</span>
                    </div>
                    <span className="font-semibold text-[#0F172A]">{d.rate}%</span>
                  </div>
                  <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4361EE] transition-all"
                      style={{ width: `${d.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admission & scholarship table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E2E8F0]">
            <Trophy className="w-4 h-4 text-[#64748B]" />
            <h2 className="font-semibold text-sm text-[#0F172A]">Элсэлтийн үр дүн ба тэтгэлэг</h2>
            <span className="ml-auto text-xs bg-[#DFEDE0] text-[#4A8C4D] font-semibold px-2.5 py-1 rounded-full">
              {admissions.filter(a => a.status === "accepted").length} тэнцсэн
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Сурагч", "Сургууль", "Улс", "Статус", "Тэтгэлэг %", "Дүн"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {admissions.map((a: ApiAdmission) => {
                const s = STATUS_STYLE[a.status] ?? STATUS_STYLE.waitlisted
                const displayName = a.studentName ?? "—"
                const amountStr = a.scholarshipAmount > 0
                  ? `${CURRENCY_SYMBOL[a.currency] ?? a.currency}${a.scholarshipAmount.toLocaleString()}`
                  : "—"
                return (
                  <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{displayName.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-[#0F172A] text-xs">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#0F172A] font-medium max-w-[160px] truncate">{a.schoolName}</td>
                    <td className="px-5 py-3 text-xs text-[#64748B]">{a.country}</td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", s.bg, s.color)}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs font-bold text-[#B8860B]">{a.scholarshipPercent > 0 ? `${a.scholarshipPercent}%` : "—"}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-[#4A8C4D]">{amountStr}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Counselor performance table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E2E8F0]">
            <Users className="w-4 h-4 text-[#64748B]" />
            <h2 className="font-semibold text-sm text-[#0F172A]">Зөвлөхийн гүйцэтгэл</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Зөвлөх", "Сурагч", "Нийт даалгавар", "Дуусгасан", "Амжилтын хувь"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {counselorPerf.map(c => (
                <tr key={c.name} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{c.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-[#0F172A]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#64748B]">{c.students}</td>
                  <td className="px-5 py-4 text-[#64748B]">{c.tasks}</td>
                  <td className="px-5 py-4 text-[#64748B]">{c.done}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-24 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#4A8C4D] rounded-full" style={{ width: `${c.rate}%` }} />
                      </div>
                      <span className={cn(
                        "text-xs font-semibold",
                        c.rate >= 85 ? "text-[#4A8C4D]" : "text-[#E8960A]"
                      )}>{c.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
