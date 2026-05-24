"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Trophy, Plus, Trash2, Edit2, CheckCircle2, Clock,
  XCircle, GraduationCap, X, ChevronDown, MapPin
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

const STATUS = {
  accepted:   { label: "Тэнцсэн",     color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]", icon: CheckCircle2 },
  waitlisted: { label: "Хүлээлгэнд",  color: "text-[#B8860B]", bg: "bg-[#FDF4D9]", icon: Clock        },
  rejected:   { label: "Татгалзсан",  color: "text-[#C0504D]", bg: "bg-[#FCE8E8]", icon: XCircle      },
  deferred:   { label: "Хойшлогдсон", color: "text-[#3451D1]", bg: "bg-[#EEF1FD]", icon: Clock        },
}

const CURRENCY_SYMBOL: Record<string, string> = { MNT: "₮", USD: "$", GBP: "£", AUD: "A$", KRW: "₩" }

const EMPTY_FORM: Omit<AdmissionResult, "id"> = {
  schoolName: "", country: "", status: "accepted",
  scholarshipPercent: 0, scholarshipAmount: 0, currency: "MNT",
  major: "", notes: "", resultDate: new Date().toISOString().split("T")[0],
}

export default function StudentAdmissionsPage() {
  const [results, setResults] = useState<AdmissionResult[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<AdmissionResult, "id">>({ ...EMPTY_FORM })

  useEffect(() => {
    fetch("/api/admissions").then(r => r.json()).then(d => setResults(d.admissions ?? []))
  }, [])

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowModal(true) }
  const openEdit = (r: AdmissionResult) => {
    const { id, ...rest } = r
    setForm(rest)
    setEditId(id)
    setShowModal(true)
  }
  const handleSave = async () => {
    if (!form.schoolName.trim()) return
    if (editId) {
      const res = await fetch(`/api/admissions/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (d.admission) setResults(prev => prev.map(r => r.id === editId ? d.admission : r))
    } else {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (d.admission) setResults(prev => [...prev, d.admission])
    }
    setShowModal(false)
  }
  const handleDelete = async (id: string) => {
    await fetch(`/api/admissions/${id}`, { method: "DELETE" })
    setResults(prev => prev.filter(r => r.id !== id))
  }

  const acceptedCount = results.filter(r => r.status === "accepted").length
  const totalMNT = results
    .filter(r => r.status === "accepted" && r.currency === "MNT")
    .reduce((s, r) => s + r.scholarshipAmount, 0)

  const f = <K extends keyof Omit<AdmissionResult, "id">>(key: K, val: Omit<AdmissionResult, "id">[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Тэнцэлтийн мэдээлэл" breadcrumb={["Сурагч", "Тэнцэлт"]} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h2 className="font-bold text-[#0F172A] text-lg">{editId ? "Мэдээлэл засах" : "Үр дүн нэмэх"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[#F8FAFC]">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Сургуулийн нэр *</label>
                <input value={form.schoolName} onChange={e => f("schoolName", e.target.value)}
                  placeholder="Harvard University..."
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Улс</label>
                  <input value={form.country} onChange={e => f("country", e.target.value)}
                    placeholder="АНУ, Канад..."
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Статус</label>
                  <div className="relative">
                    <select value={form.status} onChange={e => f("status", e.target.value as AdmissionResult["status"])}
                      className="w-full appearance-none border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2.5 text-sm outline-none focus:border-[#4361EE] bg-white">
                      <option value="accepted">Тэнцсэн</option>
                      <option value="waitlisted">Хүлээлгэнд</option>
                      <option value="rejected">Татгалзсан</option>
                      <option value="deferred">Хойшлогдсон</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Мэргэжил</label>
                  <input value={form.major} onChange={e => f("major", e.target.value)}
                    placeholder="Computer Science..."
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Үр дүн гарсан огноо</label>
                  <input type="date" value={form.resultDate} onChange={e => f("resultDate", e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Тэтгэлгийн хувь (%)</label>
                  <input type="number" min={0} max={100} value={form.scholarshipPercent}
                    onChange={e => f("scholarshipPercent", +e.target.value)} placeholder="0"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Тэтгэлгийн дүн</label>
                  <input type="number" min={0} value={form.scholarshipAmount}
                    onChange={e => f("scholarshipAmount", +e.target.value)} placeholder="0"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Валют</label>
                  <div className="relative">
                    <select value={form.currency} onChange={e => f("currency", e.target.value as AdmissionResult["currency"])}
                      className="w-full appearance-none border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2.5 text-sm outline-none focus:border-[#4361EE] bg-white">
                      <option value="MNT">₮ MNT (Төгрөг)</option>
                      <option value="USD">$ USD</option>
                      <option value="GBP">£ GBP</option>
                      <option value="AUD">A$ AUD</option>
                      <option value="KRW">₩ KRW</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Тэмдэглэл</label>
                <textarea value={form.notes} onChange={e => f("notes", e.target.value)}
                  placeholder="Нэмэлт тэмдэглэл..." rows={3}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] resize-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E2E8F0]">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                Цуцлах
              </button>
              <button onClick={handleSave} disabled={!form.schoolName.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4361EE] text-white hover:bg-[#3451D1] disabled:opacity-50 transition-colors">
                {editId ? "Хадгалах" : "Нэмэх"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <p className="text-xs text-[#64748B] mb-1">Нийт бүртгэл</p>
            <p className="text-2xl font-bold text-[#0F172A]">{results.length}</p>
            <p className="text-xs text-[#64748B] mt-0.5">сургуулийн үр дүн</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <p className="text-xs text-[#64748B] mb-1">Тэнцсэн</p>
            <p className="text-2xl font-bold text-[#4A8C4D]">{acceptedCount}</p>
            <p className="text-xs text-[#64748B] mt-0.5">сургуульд тэнцсэн</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <p className="text-xs text-[#64748B] mb-1">Нийт тэтгэлэг (MNT)</p>
            <p className="text-2xl font-bold text-[#3451D1]">₮{totalMNT.toLocaleString()}</p>
            <p className="text-xs text-[#64748B] mt-0.5">нийт тэтгэлгийн дүн</p>
          </div>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">Элсэлтийн үр дүн</h2>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3451D1] transition-colors">
            <Plus className="w-4 h-4" /> Үр дүн нэмэх
          </button>
        </div>

        {/* Cards */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="w-12 h-12 text-[#E2E8F0] mb-4" />
            <p className="text-sm font-semibold text-[#0F172A]">Одоогоор мэдээлэл байхгүй</p>
            <p className="text-xs text-[#64748B] mt-1">Тэнцсэн сургуулиуд болон тэтгэлгийн мэдээллээ нэмнэ үү</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map(r => {
              const s = STATUS[r.status]
              const Icon = s.icon
              return (
                <div key={r.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#4361EE] transition-all card-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF1FD] flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-[#3451D1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#0F172A] text-sm leading-snug">{r.schoolName}</h3>
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0 whitespace-nowrap", s.bg, s.color)}>
                          <Icon className="w-3 h-3" /> {s.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[#64748B]">
                        <MapPin className="w-3 h-3" />
                        <span>{r.country}</span>
                        {r.major && <><span className="text-[#E2E8F0]">·</span><span>{r.major}</span></>}
                      </div>
                    </div>
                  </div>

                  {r.status === "accepted" && (
                    <div className="flex items-center gap-2 mb-4">
                      {r.scholarshipPercent > 0 && (
                        <div className="flex-1 bg-[#FDF4D9] rounded-lg px-3 py-2.5 text-center">
                          <p className="text-xs text-[#64748B]">Тэтгэлэг</p>
                          <p className="text-sm font-bold text-[#B8860B]">{r.scholarshipPercent}%</p>
                        </div>
                      )}
                      {r.scholarshipAmount > 0 && (
                        <div className="flex-1 bg-[#DFEDE0] rounded-lg px-3 py-2.5 text-center">
                          <p className="text-xs text-[#64748B]">Дүн</p>
                          <p className="text-sm font-bold text-[#4A8C4D]">{CURRENCY_SYMBOL[r.currency]}{r.scholarshipAmount.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="flex-1 bg-[#F8FAFC] rounded-lg px-3 py-2.5 text-center">
                        <p className="text-xs text-[#64748B]">Огноо</p>
                        <p className="text-sm font-bold text-[#0F172A]">{r.resultDate}</p>
                      </div>
                    </div>
                  )}

                  {r.status !== "accepted" && (
                    <p className="text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg px-3 py-2 mb-4">
                      Огноо: {r.resultDate}
                    </p>
                  )}

                  {r.notes && (
                    <p className="text-xs text-[#64748B] italic bg-[#F8FAFC] rounded-lg px-3 py-2 mb-4 leading-relaxed">
                      "{r.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button onClick={() => openEdit(r)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#3451D1] px-3 py-1.5 rounded-lg hover:bg-[#EEF1FD] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Засах
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] px-3 py-1.5 rounded-lg hover:bg-[#FCE8E8] hover:text-[#C0504D] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Устгах
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
