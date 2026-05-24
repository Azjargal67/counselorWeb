"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import {
  Trophy, CheckCircle2, Clock, XCircle,
  Search, ChevronDown, GraduationCap, MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdmissionResult {
  id: string
  schoolName: string
  country: string
  status: "accepted" | "waitlisted" | "rejected" | "deferred"
  scholarshipPercent: number
  scholarshipAmount: number
  currency: "MNT" | "USD" | "GBP" | "AUD" | "KRW"
  major: string
  notes: string
  resultDate: string
}

interface StudentAdmission extends AdmissionResult {
  studentName?: string
  studentId: string
  studentGrade?: string
}

const STATUS = {
  accepted:   { label: "Тэнцсэн",     color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]", icon: CheckCircle2 },
  waitlisted: { label: "Хүлээлгэнд",  color: "text-[#B8860B]", bg: "bg-[#FDF4D9]", icon: Clock        },
  rejected:   { label: "Татгалзсан",  color: "text-[#C0504D]", bg: "bg-[#FCE8E8]", icon: XCircle      },
  deferred:   { label: "Хойшлогдсон", color: "text-[#3451D1]", bg: "bg-[#EEF1FD]", icon: Clock        },
}

const CURRENCY_SYMBOL: Record<string, string> = { MNT: "₮", USD: "$", GBP: "£", AUD: "A$", KRW: "₩" }

type StatusFilter = "all" | "accepted" | "waitlisted" | "rejected" | "deferred"

export default function CounselorAdmissionsPage() {
  const [admissions, setAdmissions] = useState<StudentAdmission[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [studentFilter, setStudentFilter] = useState("Бүгд")

  useEffect(() => {
    fetch("/api/admissions").then(r => r.json()).then(d => setAdmissions(d.admissions ?? []))
  }, [])

  const studentNames = ["Бүгд", ...Array.from(new Set(admissions.map(a => a.studentName)))]

  const filtered = admissions.filter(a => {
    const matchSearch =
      a.schoolName.toLowerCase().includes(search.toLowerCase()) ||
      (a.studentName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || a.status === statusFilter
    const matchStudent = studentFilter === "Бүгд" || a.studentName === studentFilter
    return matchSearch && matchStatus && matchStudent
  })

  const acceptedAll = admissions.filter(a => a.status === "accepted")
  const totalMNT = admissions
    .filter(a => a.status === "accepted" && a.currency === "MNT" && a.scholarshipAmount > 0)
    .reduce((s, a) => s + a.scholarshipAmount, 0)
  const uniqueSchools = new Set(admissions.map(a => a.schoolName)).size

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Тэнцэлтийн мэдээлэл" breadcrumb={["Зөвлөх", "Тэнцэлт"]} />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Нийт бүртгэл",
              value: admissions.length,
              icon: Trophy,
              color: "bg-[#EEF1FD] text-[#3451D1]",
              sub: `${new Set(admissions.map(a => a.studentName)).size} сурагч`,
            },
            {
              label: "Тэнцсэн",
              value: acceptedAll.length,
              icon: CheckCircle2,
              color: "bg-[#DFEDE0] text-[#4A8C4D]",
              sub: `${Math.round((acceptedAll.length / (admissions.length || 1)) * 100)}% тэнцэлтийн хувь`,
            },
            {
              label: "Нийт сургууль",
              value: uniqueSchools,
              icon: GraduationCap,
              color: "bg-[#FFF3E0] text-[#E8960A]",
              sub: `${new Set(admissions.map(a => a.country)).size} улс`,
            },
            {
              label: "МНТ тэтгэлэг",
              value: totalMNT > 0 ? `₮${(totalMNT / 1000000).toFixed(0)}сая` : "—",
              icon: Trophy,
              color: "bg-[#F8FAFC] text-[#64748B]",
              sub: "Нийт тэтгэлэг (MNT)",
            },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", c.color)}>
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{c.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{c.label}</p>
                <p className="text-xs text-[#4361EE] mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Сургууль, сурагч, улс хайх..."
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-[#4361EE]"
            />
          </div>

          <div className="relative">
            <select
              value={studentFilter}
              onChange={e => setStudentFilter(e.target.value)}
              className="appearance-none border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm outline-none focus:border-[#4361EE] bg-white text-[#0F172A]"
            >
              {studentNames.map(n => <option key={n}>{n}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
          </div>

          <div className="flex gap-2">
            {(["all", "accepted", "waitlisted", "rejected", "deferred"] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-[#4361EE] text-white"
                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                )}
              >
                {s === "all" ? "Бүгд" : STATUS[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="font-semibold text-[#0F172A]">
              Тэнцэлтийн жагсаалт
              <span className="ml-2 text-sm font-normal text-[#64748B]">({filtered.length} бүртгэл)</span>
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-[#64748B] text-sm">Тохирох бүртгэл олдсонгүй</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Сурагч", "Сургууль", "Улс / Мэргэжил", "Тэтгэлэг", "Статус", "Огноо"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filtered.map(a => {
                    const st = STATUS[a.status]
                    const Icon = st.icon
                    return (
                      <tr key={a.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/counselor/students/${a.studentId}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">{(a.studentName ?? "?").charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#3451D1] transition-colors">{a.studentName}</p>
                              <p className="text-xs text-[#64748B]">{a.studentGrade}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0F172A]">{a.schoolName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-xs text-[#64748B]">
                            <MapPin className="w-3 h-3" />
                            <span>{a.country}</span>
                          </div>
                          {a.major && <p className="text-xs text-[#64748B] mt-0.5">{a.major}</p>}
                        </td>
                        <td className="px-6 py-4">
                          {a.scholarshipPercent > 0 ? (
                            <div>
                              <p className="text-sm font-semibold text-[#4A8C4D]">{a.scholarshipPercent}%</p>
                              {a.scholarshipAmount > 0 && (
                                <p className="text-xs text-[#64748B]">
                                  {CURRENCY_SYMBOL[a.currency]}{a.scholarshipAmount.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#64748B]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", st.bg, st.color)}>
                            <Icon className="w-3 h-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-[#64748B]">{a.resultDate}</p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
