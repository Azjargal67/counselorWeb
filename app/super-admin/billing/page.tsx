"use client"

import { useState, useEffect, useMemo } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  CreditCard, TrendingUp, Download, CheckCircle2,
  Clock, XCircle, Search,
  Building2, ArrowUpRight, BarChart3,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface Tenant { id: string; name: string; plan: string; status: string; adminEmail?: string; startDate?: string; endDate?: string }

const mrrData = [
  { m: "9-р",  v: 8.2,  schools: 20 },
  { m: "10-р", v: 8.9,  schools: 21 },
  { m: "11-р", v: 9.5,  schools: 22 },
  { m: "12-р", v: 9.1,  schools: 22 },
  { m: "1-р",  v: 10.3, schools: 23 },
  { m: "2-р",  v: 11.0, schools: 23 },
  { m: "3-р",  v: 11.8, schools: 24 },
  { m: "4-р",  v: 12.4, schools: 24 },
]

const planPrice: Record<string, number> = { Basic: 290000, Pro: 490000, Enterprise: 890000 }
const planLimit: Record<string, string> = { Basic: "100 сурагч", Pro: "300 сурагч", Enterprise: "Хязгааргүй" }

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  paid:    { icon: CheckCircle2, label: "Төлөгдсөн",       color: "bg-[#4A8C4D]/20 text-[#6CC970]"  },
  pending: { icon: Clock,        label: "Хүлээгдэж буй",   color: "bg-[#E8960A]/20 text-[#F8CF6A]"  },
  overdue: { icon: XCircle,      label: "Хоцорсон",        color: "bg-[#C0504D]/20 text-[#F08080]"  },
}

function tenantToInvoiceStatus(status: string): "paid" | "pending" | "overdue" {
  if (status === "pending_payment") return "pending"
  if (status === "inactive") return "overdue"
  return "paid"
}

type StatusFilter = "all" | "paid" | "pending" | "overdue"

export default function SuperAdminBillingPage() {
  const [tenants, setTenants]           = useState<Tenant[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch]             = useState("")

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(d => setTenants(d.tenants ?? []))
  }, [])

  const handleConfirmPayment = async (tenantId: string) => {
    const res = await fetch(`/api/tenants/${tenantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active", startDate: new Date().toISOString().slice(0, 10) }),
    })
    const data = await res.json()
    if (data.tenant) setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...data.tenant } : t))
  }

  const invoices = useMemo(() => tenants.map((t, i) => ({
    id:       `INV-2026-${String(i + 1).padStart(3, "0")}`,
    tenantId: t.id,
    school:   t.name,
    plan:     t.plan,
    amount:   planPrice[t.plan] ?? 0,
    date:     t.startDate || `2026-04-${String((i % 28) + 1).padStart(2, "0")}`,
    status:   tenantToInvoiceStatus(t.status),
  })), [tenants])

  const filtered = useMemo(() => invoices.filter(inv => {
    const matchStatus = statusFilter === "all" || inv.status === statusFilter
    const matchSearch = inv.school.toLowerCase().includes(search.toLowerCase()) ||
                        inv.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  }), [invoices, statusFilter, search])

  const totalMRR   = useMemo(() => tenants.reduce((s, t) => s + (planPrice[t.plan] ?? 0), 0), [tenants])
  const paidCount  = useMemo(() => invoices.filter(i => i.status === "paid").length, [invoices])
  const overdueAmt = useMemo(() => invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0), [invoices])

  const fmt = (n: number) => `₮${(n / 1000000).toFixed(1)}M`
  const fmtK = (n: number) => n >= 1000 ? `₮${(n/1000).toFixed(0)}K` : `₮${n}`

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Төлбөрийн удирдлага" />

      <div className="flex-1 p-6 space-y-6">
        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Сарын орлого (MRR)",  value: fmt(totalMRR),            icon: TrendingUp,  color: "text-[#818CF8] bg-[#6366F1]/10", trend: "+8%" },
            { label: "Жилийн орлого (ARR)", value: fmt(totalMRR * 12),        icon: BarChart3,   color: "text-[#6CC970] bg-[#4A8C4D]/10",  trend: "+12%" },
            { label: "Төлөгдсөн нэхэмжлэл", value: paidCount,                 icon: CheckCircle2,color: "text-[#6CC970] bg-[#4A8C4D]/10",  trend: `${paidCount}/${invoices.length}` },
            { label: "Хоцорсон дүн",         value: fmt(overdueAmt),           icon: XCircle,     color: "text-[#F08080] bg-[#C0504D]/10",  trend: "Яаралтай" },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#F8CF6A] flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />{s.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
                <p className="text-xs text-[#94A3B8]">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* MRR area chart */}
        <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#94A3B8]" />
              <h2 className="font-semibold text-sm text-white">MRR өсөлт — сая ₮</h2>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" /> Тайлан татах
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#818CF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C3655" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#2C3655", border: "1px solid #3C4875", borderRadius: 12, fontSize: 12, color: "#fff" }}
                cursor={{ stroke: "#818CF8", strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="v" name="MRR (сая ₮)" stroke="#818CF8" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, fill: "#818CF8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {(["Basic", "Pro", "Enterprise"] as const).map(plan => {
            const count = tenants.filter(t => t.plan === plan).length
            const rev   = count * planPrice[plan]
            return (
              <div key={plan} className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    plan === "Enterprise" ? "bg-[#6366F1]/20 text-[#818CF8]"
                    : plan === "Pro"      ? "bg-[#E8960A]/20 text-[#F8CF6A]"
                    :                      "bg-[#94A3B8]/20 text-[#94A3B8]"
                  )}>{plan}</span>
                  <CreditCard className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <p className="text-xl font-bold text-white">{count} <span className="text-sm font-normal text-[#94A3B8]">сургууль</span></p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{fmtK(planPrice[plan])}/сар · {planLimit[plan]}</p>
                <p className="text-xs text-[#475569] mt-0.5">Нийт {fmt(rev)}</p>
              </div>
            )
          })}
        </div>

        {/* Invoice table */}
        <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C3655] flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#94A3B8]" />
              <h2 className="font-semibold text-sm text-white">Нэхэмжлэлүүд</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2">
                <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Хайх..."
                  className="bg-transparent text-xs text-white placeholder-[#94A3B8] outline-none w-32"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "paid", "pending", "overdue"] as StatusFilter[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                      statusFilter === s ? "bg-[#6366F1] text-white" : "bg-[#2C3655] text-[#94A3B8] hover:bg-[#3C4875]"
                    )}
                  >
                    {s === "all" ? "Бүгд" : s === "paid" ? "Төлөгдсөн" : s === "pending" ? "Хүлээгдэж буй" : "Хоцорсон"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2C3655]">
                  {["Нэхэмжлэл №", "Сургууль", "Тариф", "Дүн", "Огноо", "Төлөв", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C3655]">
                {filtered.map(inv => {
                  const cfg = statusConfig[inv.status]
                  const StatusIcon = cfg.icon
                  return (
                    <tr key={inv.id} className="hover:bg-[#2C3655]/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#94A3B8]">{inv.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#818CF8] flex-shrink-0" />
                          <span className="text-white text-xs font-medium">{inv.school}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                          inv.plan === "Enterprise" ? "bg-[#6366F1]/20 text-[#818CF8]"
                          : inv.plan === "Pro"      ? "bg-[#E8960A]/20 text-[#F8CF6A]"
                          :                          "bg-[#94A3B8]/20 text-[#94A3B8]"
                        )}>{inv.plan}</span>
                      </td>
                      <td className="px-5 py-3.5 text-white font-semibold text-xs">{fmtK(inv.amount)}</td>
                      <td className="px-5 py-3.5 text-[#94A3B8] text-xs">{inv.date}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", cfg.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {inv.status === "pending" ? (
                          <button
                            onClick={() => handleConfirmPayment(inv.tenantId)}
                            className="text-xs font-semibold text-[#6CC970] hover:text-white bg-[#4A8C4D]/20 hover:bg-[#4A8C4D]/40 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Баталгаажуулах
                          </button>
                        ) : (
                          <button className="text-xs text-[#94A3B8] hover:text-[#818CF8] transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 border-t border-[#2C3655] flex items-center justify-between">
            <p className="text-xs text-[#94A3B8]">{filtered.length} нэхэмжлэл</p>
            <p className="text-xs text-[#94A3B8]">
              Нийт: <span className="text-white font-semibold">
                {fmtK(filtered.reduce((s, i) => s + i.amount, 0))}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
