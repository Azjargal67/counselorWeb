"use client"

import { useState, useEffect, useMemo } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Building2, Search, Plus, Users, HardDrive,
  Calendar, ChevronDown, Pencil, Trash2,
  CheckCircle2, AlertTriangle, Clock, CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Tenant { id: string; name: string; plan: string; status: string; storageUsed?: string; adminEmail?: string; counselorCount?: number; studentCount?: number; startDate?: string; endDate?: string }

type PlanFilter = "all" | "Basic" | "Pro" | "Enterprise"

const planConfig: Record<string, string> = {
  Enterprise: "bg-[#6366F1]/20 text-[#818CF8]",
  Pro:        "bg-[#E8960A]/20 text-[#F8CF6A]",
  Basic:      "bg-[#94A3B8]/20 text-[#94A3B8]",
}
const planLimit: Record<string, number | null> = {
  Basic:      100,
  Pro:        300,
  Enterprise: null,
}
const statusIcon: Record<string, React.ElementType> = {
  pending_payment: CreditCard,
  active:          CheckCircle2,
  expiring:        AlertTriangle,
  inactive:        Clock,
}
const statusColor: Record<string, string> = {
  pending_payment: "text-[#F8CF6A]",
  active:          "text-[#6CC970]",
  expiring:        "text-[#F8CF6A]",
  inactive:        "text-[#94A3B8]",
}
const statusLabel: Record<string, string> = {
  pending_payment: "Төлбөр хүлээгдэж байна",
  active:          "Идэвхтэй",
  expiring:        "Дуусах гэж байна",
  inactive:        "Идэвхгүй",
}

export default function SuperAdminSchoolsPage() {
  const [tenants, setTenants]       = useState<Tenant[]>([])
  const [search, setSearch]         = useState("")
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all")
  const [showModal, setShowModal]   = useState(false)
  const [newName, setNewName]       = useState("")
  const [newPlan, setNewPlan]       = useState("Basic")
  const [newEndDate, setNewEndDate] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPass, setAdminPass]   = useState("")
  const [adminName, setAdminName]   = useState("")
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState("")

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(d => setTenants(d.tenants ?? []))
  }, [])

  const filtered = useMemo(() => tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchPlan   = planFilter === "all" || t.plan === planFilter
    return matchSearch && matchPlan
  }), [tenants, search, planFilter])

  const counts = useMemo(() => ({
    all:        tenants.length,
    Basic:      tenants.filter(t => t.plan === "Basic").length,
    Pro:        tenants.filter(t => t.plan === "Pro").length,
    Enterprise: tenants.filter(t => t.plan === "Enterprise").length,
  }), [tenants])

  const handleAdd = async () => {
    if (!newName.trim() || !adminEmail.trim() || !adminPass.trim() || !adminName.trim()) return
    setSaving(true)
    setSaveError("")
    try {
      const tenantRes = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, plan: newPlan, endDate: newEndDate, adminEmail }),
      })
      const td = await tenantRes.json()
      if (!td.tenant) throw new Error(td.error ?? "Tenant үүсгэхэд алдаа гарлаа")

      const userRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPass, role: "admin", school: newName }),
      })
      const ud = await userRes.json()
      if (!ud.user && !ud.error?.includes("бүртгэлтэй")) {
        throw new Error(ud.error ?? "Admin хэрэглэгч үүсгэхэд алдаа")
      }

      setTenants(prev => [td.tenant, ...prev])
      setShowModal(false)
      setNewName(""); setNewPlan("Basic"); setNewEndDate("")
      setAdminEmail(""); setAdminPass(""); setAdminName("")
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Алдаа гарлаа")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tenants/${id}`, { method: "DELETE" })
    setTenants(prev => prev.filter(t => t.id !== id))
  }

  const handleActivate = async (id: string) => {
    const res = await fetch(`/api/tenants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active", startDate: new Date().toISOString().slice(0, 10) }),
    })
    const data = await res.json()
    if (data.tenant) setTenants(prev => prev.map(t => t.id === id ? { ...t, ...data.tenant } : t))
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Сургуулийн удирдлага" />

      <div className="flex-1 p-6 space-y-5">
        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Нийт сургууль",        value: tenants.length,                                                   color: "border-[#6366F1]" },
            { label: "Идэвхтэй",             value: tenants.filter(t => t.status === "active" || t.status === "expiring").length, color: "border-[#4A8C4D]" },
            { label: "Төлбөр хүлээгдэж байна", value: tenants.filter(t => t.status === "pending_payment").length,      color: "border-[#F8CF6A]" },
            { label: "Дуусах гэж байна",     value: tenants.filter(t => t.status === "expiring").length,              color: "border-[#E8960A]" },
          ].map(s => (
            <div key={s.label} className={cn("bg-[#1E2540] rounded-2xl border-l-4 p-4", s.color)}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 bg-[#1E2540] border border-[#2C3655] rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Сургуулийн нэрээр хайх..."
              className="bg-transparent text-sm text-white placeholder-[#94A3B8] outline-none w-full"
            />
          </div>
          {/* Plan filter */}
          <div className="flex gap-1.5">
            {(["all", "Basic", "Pro", "Enterprise"] as PlanFilter[]).map(p => (
              <button
                key={p}
                onClick={() => setPlanFilter(p)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  planFilter === p
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#2C3655] text-[#94A3B8] hover:bg-[#3C4875]"
                )}
              >
                {p === "all" ? `Бүгд (${counts.all})` : `${p} (${counts[p]})`}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-[#6366F1] hover:bg-[#8FA3D8] text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Сургууль нэмэх
          </button>
        </div>

        {/* Schools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => {
            const StatusIcon = statusIcon[t.status]
            return (
              <div key={t.id} className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-5 hover:border-[#6366F1]/40 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6366F1]/15 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#818CF8]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm leading-tight">{t.name}</p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block", planConfig[t.plan])}>
                        {t.plan}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-[#2C3655] transition-colors text-[#94A3B8] hover:text-white">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-[#C0504D]/20 transition-colors text-[#94A3B8] hover:text-[#C0504D]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[#2C3655] rounded-xl px-3 py-2.5 text-center">
                    <Users className="w-3.5 h-3.5 text-[#94A3B8] mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">{t.counselorCount ?? "—"}</p>
                    <p className="text-[10px] text-[#94A3B8]">Зөвлөх</p>
                  </div>
                  <div className="bg-[#2C3655] rounded-xl px-3 py-2.5 text-center">
                    <HardDrive className="w-3.5 h-3.5 text-[#94A3B8] mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">{t.storageUsed ?? "—"}</p>
                    <p className="text-[10px] text-[#94A3B8]">Storage</p>
                  </div>
                </div>
                {/* Student capacity bar */}
                {(() => {
                  const count = t.studentCount ?? 0
                  const limit = planLimit[t.plan]
                  const pct   = limit ? Math.min((count / limit) * 100, 100) : 0
                  const over  = limit ? pct >= 90 : false
                  return (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                          <Users className="w-3 h-3" />
                          <span>Сурагч</span>
                        </div>
                        <span className={cn("text-[10px] font-semibold", over ? "text-[#F08080]" : "text-[#94A3B8]")}>
                          {count} / {limit ?? "∞"}
                        </span>
                      </div>
                      {limit ? (
                        <div className="h-1.5 bg-[#2C3655] rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", over ? "bg-[#F08080]" : pct >= 70 ? "bg-[#F8CF6A]" : "bg-[#6CC970]")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      ) : (
                        <div className="h-1.5 bg-[#6366F1]/20 rounded-full">
                          <div className="h-full w-full bg-[#6366F1]/40 rounded-full" />
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <StatusIcon className={cn("w-3.5 h-3.5", statusColor[t.status])} />
                    <span className={statusColor[t.status]}>{statusLabel[t.status]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                    <Calendar className="w-3 h-3" />
                    <span>{t.endDate}</span>
                  </div>
                </div>

                {t.status === "pending_payment" && (
                  <div className="mt-3 pt-3 border-t border-[#2C3655]">
                    <button
                      onClick={() => handleActivate(t.id)}
                      className="w-full text-xs font-semibold bg-[#4A8C4D]/20 hover:bg-[#4A8C4D]/30 text-[#6CC970] py-2 rounded-lg transition-colors"
                    >
                      Төлбөр баталгаажуулах → Идэвхжүүлэх
                    </button>
                  </div>
                )}
                {t.status === "expiring" && (
                  <div className="mt-3 pt-3 border-t border-[#2C3655]">
                    <button className="w-full text-xs font-semibold bg-[#E8960A]/20 hover:bg-[#E8960A]/30 text-[#F8CF6A] py-2 rounded-lg transition-colors">
                      Гэрээ сунгах
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add school modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#1E2540] rounded-2xl w-full max-w-md border border-[#2C3655]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2C3655]">
              <h3 className="font-semibold text-white">Шинэ сургууль нэмэх</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#2C3655] rounded-lg transition-colors text-[#94A3B8]">
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-[#94A3B8] bg-[#2C3655] rounded-lg px-3 py-2">Сургуулийн мэдээлэл</p>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Сургуулийн нэр *</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Сургуулийн нэр оруулна уу"
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Тариф</label>
                <div className="relative">
                  <select value={newPlan} onChange={e => setNewPlan(e.target.value)} className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366F1] appearance-none">
                    <option>Basic</option>
                    <option>Pro</option>
                    <option>Enterprise</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Гэрээний хугацаа</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>

              <p className="text-xs text-[#94A3B8] bg-[#2C3655] rounded-lg px-3 py-2 mt-2">Сургуулийн администраторын бүртгэл</p>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Admin-ийн нэр *</label>
                <input
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="Нэр оруулна уу"
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Admin и-мэйл *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin@school.edu.mn"
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Нэвтрэх нууц үг *</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="Нууц үг"
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
              </div>
              {saveError && <p className="text-xs text-[#F08080] bg-[#C0504D]/10 rounded-lg px-3 py-2">{saveError}</p>}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setShowModal(false); setSaveError("") }} className="flex-1 border border-[#2C3655] text-[#94A3B8] hover:bg-[#2C3655] py-2.5 rounded-xl text-sm font-medium transition-colors">
                Цуцлах
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim() || !adminEmail.trim() || !adminPass.trim() || !adminName.trim()}
                className="flex-1 bg-[#6366F1] hover:bg-[#8FA3D8] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? "Хадгалж байна..." : "Нэмэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
