"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Building2, Users, CreditCard, TrendingUp, ArrowUpRight,
  ChevronRight, AlertTriangle, CheckCircle2,
  Activity, BarChart3, Zap,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface Tenant { id: string; name: string; plan: string; status: string; adminEmail?: string; counselorCount?: number; studentCount?: number; storageUsed?: string; startDate?: string; endDate?: string }

const PLAN_PRICE: Record<string, number> = { Basic: 290000, Pro: 490000, Enterprise: 890000 }

const mrr = [
  { m: "9-р", v: 8.2  },
  { m: "10-р",v: 8.9  },
  { m: "11-р",v: 9.5  },
  { m: "12-р",v: 9.1  },
  { m: "1-р", v: 10.3 },
  { m: "2-р", v: 11.0 },
  { m: "3-р", v: 11.8 },
  { m: "4-р", v: 12.4 },
]

const statusConfig: Record<string, string> = {
  active:   "bg-[#DFEDE0] text-[#4A8C4D]",
  expiring: "bg-[#FFF3E0] text-[#E8960A]",
  inactive: "bg-[#EAE6E0] text-[#8B8680]",
}
const statusLabel: Record<string, string> = {
  active: "Идэвхтэй", expiring: "Дуусах гэж байна", inactive: "Идэвхгүй",
}

export default function SuperAdminOverviewPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(d => setTenants(d.tenants ?? []))
  }, [])

  const expiringCount = useMemo(() => tenants.filter(t => t.status === "expiring").length, [tenants])
  const activeCount   = useMemo(() => tenants.filter(t => t.status === "active").length,   [tenants])
  const totalUsers    = useMemo(() => tenants.reduce((s, t) => s + (t.studentCount ?? 0) + (t.counselorCount ?? 0), 0), [tenants])
  const totalMRR      = useMemo(() => tenants.reduce((s, t) => s + (PLAN_PRICE[t.plan] ?? 0), 0) / 1000000, [tenants])

  const stats = [
    { label: "Нийт сургууль",  value: tenants.length, icon: Building2,  color: "text-[#818CF8] bg-[#6366F1]/10", trend: `${tenants.length}`  },
    { label: "Идэвхтэй",       value: activeCount,    icon: CheckCircle2,color: "text-[#4A8C4D] bg-[#4A8C4D]/10", trend: `${activeCount}`     },
    { label: "Нийт хэрэглэгч", value: totalUsers,     icon: Users,       color: "text-[#E8960A] bg-[#E8960A]/10", trend: `${totalUsers}`      },
    { label: "Сарын орлого",   value: totalMRR > 0 ? `₮${totalMRR.toFixed(1)}M` : "—", icon: CreditCard, color: "text-[#C0504D] bg-[#C0504D]/10", trend: "+8%" },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Системийн хяналт" />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-[#1E2540] text-white p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94A3B8] mb-1">Super Admin · EduCounsel Platform</p>
            <h1 className="text-2xl font-bold mb-1">Системийн тойм</h1>
            <p className="text-sm text-[#CBD5E1]">
              <span className="text-[#F8CF6A] font-semibold">{expiringCount} сургуулийн</span> гэрээ дуусах гэж байна.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Platform uptime</p>
              <p className="text-3xl font-bold text-[#818CF8]">99.9%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#818CF8]" />
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#1E2540] rounded-2xl p-5 border border-[#2C3655]">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-[#4A8C4D]">
                    <ArrowUpRight className="w-3 h-3" />{s.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
                <p className="text-xs text-[#94A3B8]">{s.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MRR chart */}
          <div className="lg:col-span-2 bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#94A3B8]" />
                <h2 className="font-semibold text-sm text-white">Сарын орлого (MRR) — сая ₮</h2>
              </div>
              <span className="text-xs text-[#4A8C4D] flex items-center gap-0.5 font-semibold">
                <TrendingUp className="w-3 h-3" /> +8% энэ сар
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={mrr}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C3655" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#2C3655", border: "1px solid #3C4875", borderRadius: 12, fontSize: 12, color: "#fff" }}
                  cursor={{ stroke: "#818CF8", strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="v" name="MRR (сая ₮)" stroke="#818CF8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#818CF8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts + activity */}
          <div className="space-y-4">
            <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-[#E8960A]" />
                <h2 className="font-semibold text-sm text-white">Системийн мэдэгдэл</h2>
              </div>
              <div className="space-y-2">
                {[
                  { text: "Орхон Сургуулийн гэрээ 7 хоногт дуусна", type: "warn" },
                  { text: "3 сургуулийн storage 90%+", type: "warn" },
                  { text: "Нийт uptime: 99.9%", type: "ok" },
                ].map((a, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-2 text-xs rounded-lg px-3 py-2",
                    a.type === "ok" ? "bg-[#4A8C4D]/20 text-[#6CC970]" : "bg-[#E8960A]/15 text-[#F8CF6A]"
                  )}>
                    {a.type === "ok"
                      ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    }
                    <span>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-[#94A3B8]" />
                <h2 className="font-semibold text-sm text-white">Хурдан холбоос</h2>
              </div>
              <div className="space-y-2">
                <Link href="/super-admin/schools" className="flex items-center justify-between p-3 rounded-xl bg-[#2C3655] hover:bg-[#3C4875] transition-colors">
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                    <Building2 className="w-4 h-4 text-[#818CF8]" /> Сургуулиуд
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </Link>
                <Link href="/super-admin/billing" className="flex items-center justify-between p-3 rounded-xl bg-[#2C3655] hover:bg-[#3C4875] transition-colors">
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E1]">
                    <CreditCard className="w-4 h-4 text-[#818CF8]" /> Төлбөр
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant list */}
        <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C3655]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#94A3B8]" />
              <h2 className="font-semibold text-sm text-white">Бүх сургуулиуд</h2>
            </div>
            <Link href="/super-admin/schools" className="text-xs text-[#818CF8] hover:underline flex items-center gap-1">
              Бүгд <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C3655]">
                  {["Сургуулийн нэр", "Тариф", "Зөвлөх", "Сурагч", "Хугацаа", "Төлөв"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C3655]">
                {tenants.slice(0, 6).map(t => (
                  <tr key={t.id} className="hover:bg-[#2C3655]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-[#818CF8]" />
                        </div>
                        <span className="font-medium text-white text-sm">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        t.plan === "Enterprise" ? "bg-[#6366F1]/20 text-[#818CF8]"
                        : t.plan === "Pro"      ? "bg-[#E8960A]/20 text-[#F8CF6A]"
                        :                        "bg-[#94A3B8]/20 text-[#94A3B8]"
                      )}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#94A3B8] text-xs">{t.counselorCount ?? "—"}</td>
                    <td className="px-5 py-4 text-[#94A3B8] text-xs">{t.studentCount ?? "—"}</td>
                    <td className="px-5 py-4 text-[#94A3B8] text-xs whitespace-nowrap">{t.endDate ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusConfig[t.status])}>
                        {statusLabel[t.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
