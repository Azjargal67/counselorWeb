"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Search, UserCheck, GraduationCap, ChevronDown,
  Pencil, Trash2, UserPlus, Shield, BookOpen, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AcademicYear {
  gradeYear: "10" | "11" | "12"
  gpa?: number | ""
  sat?: number | ""
  act?: number | ""
  toefl?: number | ""
  ielts?: number | ""
}

interface User {
  id: string; name: string; email: string; role: string
  grade?: string; school?: string; status: "active" | "inactive"
  academicHistory?: AcademicYear[]
}

type RoleFilter = "all" | "student" | "counselor" | "teacher"

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  student:      { label: "Сурагч",  color: "bg-[#EEF1FD] text-[#3451D1]", icon: GraduationCap },
  counselor:    { label: "Зөвлөх", color: "bg-[#DFEDE0] text-[#4A8C4D]", icon: UserCheck     },
  teacher:      { label: "Багш",   color: "bg-[#FFF3E0] text-[#E8960A]", icon: Shield        },
  admin:        { label: "Админ",  color: "bg-[#FCE8E8] text-[#C0504D]", icon: Shield        },
  "super-admin":{ label: "Super",  color: "bg-[#1E2540] text-white",      icon: Shield        },
}

const tabList: { key: RoleFilter; label: string }[] = [
  { key: "all",      label: "Бүгд"   },
  { key: "student",  label: "Сурагч" },
  { key: "counselor",label: "Зөвлөх"},
  { key: "teacher",  label: "Багш"   },
]

const gradeYears: { year: "10" | "11" | "12"; label: string }[] = [
  { year: "10", label: "10-р анги" },
  { year: "11", label: "11-р анги" },
  { year: "12", label: "12-р анги" },
]

function emptyAcademic(): AcademicYear[] {
  return gradeYears.map(g => ({ gradeYear: g.year, gpa: "", sat: "", act: "", toefl: "", ielts: "" }))
}

function mergeAcademic(existing?: AcademicYear[]): AcademicYear[] {
  return gradeYears.map(g => {
    const found = existing?.find(e => e.gradeYear === g.year)
    return found ? { ...found } : { gradeYear: g.year, gpa: "", sat: "", act: "", toefl: "", ielts: "" }
  })
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<User[]>([])
  const [tab, setTab]             = useState<RoleFilter>("all")
  const [search, setSearch]       = useState("")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState({ name: "", email: "", password: "", role: "student", grade: "" })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")

  // Grade modal state
  const [gradeStudent, setGradeStudent]   = useState<User | null>(null)
  const [gradeTab, setGradeTab]           = useState<"10" | "11" | "12">("10")
  const [gradeData, setGradeData]         = useState<AcademicYear[]>(emptyAcademic())
  const [gradeSaving, setGradeSaving]     = useState(false)
  const [gradeError, setGradeError]       = useState("")

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(d => setUsers((d.users ?? []).filter((u: User) => u.role !== "super-admin" && u.role !== "admin")))
      .catch(console.error)
  }, [])

  const filtered = users.filter(u => {
    const matchTab    = tab === "all" || u.role === tab
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts: Record<RoleFilter, number> = {
    all:       users.length,
    student:   users.filter(u => u.role === "student").length,
    counselor: users.filter(u => u.role === "counselor").length,
    teacher:   users.filter(u => u.role === "teacher").length,
  }

  function openGradeModal(u: User) {
    setGradeStudent(u)
    setGradeData(mergeAcademic(u.academicHistory))
    setGradeTab("10")
    setGradeError("")
  }

  function updateGradeField(year: string, field: keyof Omit<AcademicYear, "gradeYear">, value: string) {
    setGradeData(prev => prev.map(g =>
      g.gradeYear === year ? { ...g, [field]: value === "" ? "" : Number(value) } : g
    ))
  }

  async function deleteUser(id: string) {
    if (!confirm("Энэ хэрэглэгчийг устгах уу?")) return
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (res.ok) setUsers(prev => prev.filter(u => u.id !== id))
  }

  async function saveGrades() {
    if (!gradeStudent) return
    setGradeSaving(true); setGradeError("")
    try {
      const body = gradeData.map(g => ({
        gradeYear: g.gradeYear,
        ...(g.gpa   !== "" ? { gpa:   Number(g.gpa)   } : {}),
        ...(g.sat   !== "" ? { sat:   Number(g.sat)   } : {}),
        ...(g.act   !== "" ? { act:   Number(g.act)   } : {}),
        ...(g.toefl !== "" ? { toefl: Number(g.toefl) } : {}),
        ...(g.ielts !== "" ? { ielts: Number(g.ielts) } : {}),
      }))
      const res = await fetch(`/api/users/${gradeStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academicHistory: body }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? "Алдаа гарлаа")
      setUsers(prev => prev.map(u => u.id === gradeStudent.id ? { ...u, academicHistory: d.user.academicHistory } : u))
      setGradeStudent(null)
    } catch (e) {
      setGradeError(e instanceof Error ? e.message : "Алдаа гарлаа")
    } finally {
      setGradeSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Хэрэглэгч удирдах" />

      <div className="flex-1 p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 min-w-64">
            <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Нэр, имэйлээр хайх..."
              className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-[#4361EE] hover:bg-[#3451D1] text-white px-4 py-2 rounded-xl transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Хэрэглэгч нэмэх
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 flex-wrap">
          {tabList.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-[#4361EE] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              )}
            >
              {t.label}
              <span className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                tab === t.key ? "bg-white/30" : "bg-[#E2E8F0] text-[#6B6460]"
              )}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Хэрэглэгч</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide hidden md:table-cell">Имэйл</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Үүрэг</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Төлөв</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[#64748B] uppercase tracking-wide">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map(u => {
                const cfg = roleConfig[u.role]
                const Icon = cfg.icon
                const hasGrades = u.academicHistory && u.academicHistory.length > 0
                return (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{u.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{u.name}</p>
                          {u.grade && <p className="text-xs text-[#64748B]">{u.grade}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#64748B] text-xs hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", cfg.color)}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        u.status === "active" ? "bg-[#DFEDE0] text-[#4A8C4D]" : "bg-[#E2E8F0] text-[#64748B]"
                      )}>
                        {u.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {u.role === "student" && (
                          <button
                            onClick={() => openGradeModal(u)}
                            title="Дүн оруулах"
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              hasGrades
                                ? "bg-[#EEF1FD] text-[#3451D1] hover:bg-[#dde5fc]"
                                : "hover:bg-[#EEF1FD] text-[#64748B] hover:text-[#3451D1]"
                            )}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-[#EEF1FD] transition-colors text-[#3451D1]">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg hover:bg-[#FCE8E8] transition-colors text-[#C0504D]">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[#64748B] text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />
              Хэрэглэгч олдсонгүй
            </div>
          )}
          <div className="px-5 py-3.5 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">{filtered.length} хэрэглэгч харагдаж байна</p>
          </div>
        </div>
      </div>

      {/* Add user modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setFormError("") }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Шинэ хэрэглэгч нэмэх</h3>
              <button onClick={() => { setShowModal(false); setFormError("") }} className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "name",     label: "Бүтэн нэр *",  type: "text",     ph: "Нэр оруулна уу" },
                { key: "email",    label: "Имэйл *",       type: "email",    ph: "email@edu.mn"   },
                { key: "password", label: "Нууц үг *",     type: "password", ph: "Нэвтрэх нууц үг"},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.ph}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#C8C4BE] outline-none focus:border-[#4361EE] transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Үүрэг</label>
                <div className="relative">
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] appearance-none bg-white">
                    <option value="student">Сурагч</option>
                    <option value="counselor">Зөвлөх</option>
                    <option value="teacher">Багш</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>
              </div>
              {form.role === "student" && (
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Анги</label>
                  <input type="text" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                    placeholder="10-р анги"
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#C8C4BE] outline-none focus:border-[#4361EE] transition-colors" />
                </div>
              )}
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setShowModal(false); setFormError("") }}
                className="flex-1 border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] py-2.5 rounded-xl text-sm font-medium transition-colors">
                Цуцлах
              </button>
              <button
                disabled={saving || !form.name.trim() || !form.email.trim() || !form.password.trim()}
                onClick={async () => {
                  setSaving(true); setFormError("")
                  try {
                    const res = await fetch("/api/users", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    })
                    const d = await res.json()
                    if (!res.ok) throw new Error(d.error ?? "Алдаа гарлаа")
                    setUsers(prev => [...prev, d.user])
                    setShowModal(false)
                    setForm({ name: "", email: "", password: "", role: "student", grade: "" })
                  } catch (e) {
                    setFormError(e instanceof Error ? e.message : "Алдаа гарлаа")
                  } finally {
                    setSaving(false)
                  }
                }}
                className="flex-1 bg-[#4361EE] hover:bg-[#3451D1] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? "Хадгалж байна..." : "Нэмэх"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade entry modal */}
      {gradeStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setGradeStudent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-semibold text-[#0F172A]">Дүн оруулах</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{gradeStudent.name} · {gradeStudent.grade ?? "—"}</p>
              </div>
              <button onClick={() => setGradeStudent(null)} className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            {/* Grade year tabs */}
            <div className="flex gap-1 mx-6 mt-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1">
              {gradeYears.map(g => (
                <button
                  key={g.year}
                  onClick={() => setGradeTab(g.year)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    gradeTab === g.year
                      ? "bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Fields for selected year */}
            {gradeYears.map(g => {
              if (g.year !== gradeTab) return null
              const row = gradeData.find(d => d.gradeYear === g.year)!
              return (
                <div key={g.year} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">GPA <span className="font-normal text-[#64748B]">(0 – 4.0)</span></label>
                      <input type="number" step="0.01" min="0" max="4"
                        value={row.gpa ?? ""}
                        onChange={e => updateGradeField(g.year, "gpa", e.target.value)}
                        placeholder="3.80"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">SAT <span className="font-normal text-[#64748B]">(400 – 1600)</span></label>
                      <input type="number" min="400" max="1600"
                        value={row.sat ?? ""}
                        onChange={e => updateGradeField(g.year, "sat", e.target.value)}
                        placeholder="1450"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">ACT <span className="font-normal text-[#64748B]">(1 – 36)</span></label>
                      <input type="number" min="1" max="36"
                        value={row.act ?? ""}
                        onChange={e => updateGradeField(g.year, "act", e.target.value)}
                        placeholder="32"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">TOEFL <span className="font-normal text-[#64748B]">(0 – 120)</span></label>
                      <input type="number" min="0" max="120"
                        value={row.toefl ?? ""}
                        onChange={e => updateGradeField(g.year, "toefl", e.target.value)}
                        placeholder="105"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">IELTS <span className="font-normal text-[#64748B]">(0 – 9.0)</span></label>
                      <input type="number" step="0.5" min="0" max="9"
                        value={row.ielts ?? ""}
                        onChange={e => updateGradeField(g.year, "ielts", e.target.value)}
                        placeholder="7.5"
                        className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4361EE] transition-colors" />
                    </div>
                  </div>
                </div>
              )
            })}

            {gradeError && (
              <p className="mx-6 text-xs text-[#C0504D] bg-[#FCE8E8] rounded-lg px-3 py-2">{gradeError}</p>
            )}

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setGradeStudent(null)}
                className="flex-1 border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] py-2.5 rounded-xl text-sm font-medium transition-colors">
                Цуцлах
              </button>
              <button
                disabled={gradeSaving}
                onClick={saveGrades}
                className="flex-1 bg-[#4361EE] hover:bg-[#3451D1] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {gradeSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
