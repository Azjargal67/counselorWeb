"use client"

import { useState, useEffect, useMemo } from "react"
import { AppTopbar } from "@/components/app-topbar"
import { StatusBadge } from "@/components/status-badge"
import {
  Search, ChevronDown, Plus,
  Star, Trash2, CheckCircle2, Filter, ArrowUpDown,
  Calendar, ChevronLeft, ChevronRight, X
} from "lucide-react"

type TaskStatus = "all" | "todo" | "in-progress" | "done" | "overdue"

const STATUS_PILLS: { key: TaskStatus; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "todo", label: "Хийгдээгүй" },
  { key: "in-progress", label: "Хийгдэж буй" },
  { key: "done", label: "Дууссан" },
  { key: "overdue", label: "Хэтэрсэн" },
]

const categoryLabel: Record<string, string> = {
  essay: "Essay", cv: "CV", transcript: "Transcript",
  recommendation: "Recommendation", "test-prep": "Шалгалт",
  interview: "Интервью", other: "Бусад",
}

const categoryColor: Record<string, string> = {
  essay: "bg-[#EEF1FD] text-[#3451D1]",
  cv: "bg-[#DFEDE0] text-[#4A8C4D]",
  transcript: "bg-[#FDF4D9] text-[#B8860B]",
  recommendation: "bg-[#F7DDDD] text-[#C0504D]",
  "test-prep": "bg-[#E2E8F0] text-[#64748B]",
  interview: "bg-[#FEF0E6] text-[#C47A35]",
  other: "bg-[#E2E8F0] text-[#64748B]",
}

const priorityColor: Record<string, string> = {
  high: "text-[#C0504D]",
  medium: "text-[#B8860B]",
  low: "text-[#4A8C4D]",
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= value ? "fill-[#F5D76E] text-[#F5D76E]" : "text-[#E2E8F0]"}`} />
      ))}
    </div>
  )
}

interface Task {
  id: string; title: string; description: string; category: string
  status: "todo" | "in-progress" | "done" | "overdue"
  deadline: string; priority: "low" | "medium" | "high"
  progress: number; studentId: string; studentName?: string; createdAt: string
}

const PAGE_SIZE = 8

export default function CounselorTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TaskStatus>("all")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [sortAsc, setSortAsc] = useState(true)

  // Create task modal
  const [showModal, setShowModal] = useState(false)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({ title: "", category: "essay", deadline: "", studentId: "", priority: "medium", description: "" })
  const [allStudents, setAllStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.json())
      .then(d => setTasks(d.tasks ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
    fetch("/api/users?role=student")
      .then(r => r.json())
      .then(d => setStudents((d.users ?? []).map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }))))
      .catch(console.error)
  }, [])

  const openModal = () => {
    setForm({ title: "", category: "essay", deadline: "", studentId: "", priority: "medium", description: "" })
    setAllStudents(false)
    setShowModal(true)
  }

  const submitTask = async () => {
    if (!form.title || !form.deadline) return
    if (!allStudents && !form.studentId) return
    setSubmitting(true)
    const targets = allStudents ? students : students.filter(s => s.id === form.studentId)
    const results = await Promise.all(
      targets.map(s => fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, studentId: s.id }),
      }).then(r => r.ok ? r.json() : null))
    )
    const newTasks = results
      .filter(Boolean)
      .map(data => {
        const t = data.task
        const student = students.find(s => s.id === (t.studentId?._id ?? t.studentId))
        return { ...t, id: t._id ?? t.id, studentName: student?.name }
      })
    setTasks(prev => [...newTasks, ...prev])
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = useMemo(() => tasks
    .filter(t => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.studentName ?? "").toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
    .sort((a, b) => sortAsc
      ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      : new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
    )
  , [tasks, statusFilter, search, sortAsc])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map(t => t.id)))
    }
  }

  const deleteSelected = async () => {
    if (!confirm(`${selectedIds.size} даалгаврыг устгах уу?`)) return
    await Promise.all([...selectedIds].map(id => fetch(`/api/tasks/${id}`, { method: "DELETE" })))
    setTasks(prev => prev.filter(t => !selectedIds.has(t.id)))
    setSelectedIds(new Set())
  }

  const deleteTask = async (id: string) => {
    if (!confirm("Энэ даалгаврыг устгах уу?")) return
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const statusCounts: Record<TaskStatus, number> = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
  }

  const uniqueStudents = useMemo(() => {
    const map = new Map<string, string>()
    tasks.forEach(t => { if (t.studentName) map.set(t.studentId, t.studentName) })
    return Array.from(map.entries())
  }, [tasks])

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Даалгаврын менежмент" breadcrumb={["Counselor"]} />

      <div className="flex-1 p-6 space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#64748B]">Нийт <span className="font-semibold text-[#0F172A]">{tasks.length}</span> даалгавар</p>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#3451D1] transition-colors">
            <Plus className="w-4 h-4" />
            Шинэ даалгавар
          </button>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_PILLS.map(pill => (
            <button
              key={pill.key}
              onClick={() => { setStatusFilter(pill.key); setPage(1) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === pill.key
                  ? "bg-[#4361EE] text-white shadow-sm"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE] hover:text-[#3451D1]"
              }`}
            >
              {pill.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                statusFilter === pill.key ? "bg-white/30 text-white" : "bg-[#E2E8F0] text-[#64748B]"
              }`}>
                {statusCounts[pill.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input
                type="text"
                placeholder="Даалгавар эсвэл сурагчаар хайх..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full"
              />
            </div>

            <div className="relative">
              <select className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm text-[#0F172A] outline-none cursor-pointer">
                <option>Бүх сурагч</option>
                {uniqueStudents.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
            </div>

            <div className="relative">
              <select className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-sm text-[#0F172A] outline-none cursor-pointer">
                <option>Бүх төрөл</option>
                {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-4 h-4 text-[#64748B]" />
              <span className="text-sm text-[#64748B]">{filtered.length} үр дүн</span>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="bg-[#4361EE] rounded-xl px-5 py-3 flex items-center gap-4">
            <span className="text-white text-sm font-medium">{selectedIds.size} сонгогдсон</span>
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              Дуусгасан гэж тэмдэглэх
            </button>
            <button onClick={deleteSelected} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              Устгах
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-white/70 hover:text-white text-sm"
            >
              Цуцлах
            </button>
          </div>
        )}

        {/* Data table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={toggleAll}
                    className="rounded border-[#E2E8F0] accent-[#4361EE]"
                  />
                </th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">Даалгавар</th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">Сурагч</th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">Төрөл</th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">
                  <button
                    onClick={() => setSortAsc(v => !v)}
                    className="flex items-center gap-1 hover:text-[#0F172A] transition-colors"
                  >
                    Deadline
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">Төлөв</th>
                <th className="text-left font-semibold text-[#64748B] px-4 py-3">Явц</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading && (
                <tr><td colSpan={8} className="text-center py-8 text-sm text-[#64748B]">Уншиж байна...</td></tr>
              )}
              {!loading && paginated.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-sm text-[#64748B]">Даалгавар олдсонгүй</td></tr>
              )}
              {paginated.map(task => (
                <tr
                  key={task.id}
                  className={`hover:bg-[#F8FAFC] transition-colors ${selectedIds.has(task.id) ? "bg-[#F0F3FF]" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.id)}
                      onChange={() => toggleSelect(task.id)}
                      className="rounded border-[#E2E8F0] accent-[#4361EE]"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-[#0F172A] truncate max-w-[200px]">{task.title}</p>
                    <p className={`text-xs font-medium mt-0.5 ${priorityColor[task.priority]}`}>
                      {task.priority === "high" ? "Өндөр" : task.priority === "medium" ? "Дунд" : "Бага"} ач холбогдол
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">{(task.studentName ?? "?").charAt(0)}</span>
                      </div>
                      <span className="text-[#0F172A] truncate max-w-[120px]">{task.studentName ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColor[task.category]}`}>
                      {categoryLabel[task.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{task.deadline?.split("T")[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StarRating value={Math.ceil(task.progress / 20)} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-[#FCE8E8] transition-colors text-[#64748B] hover:text-[#C0504D]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-xs text-[#64748B]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#64748B]" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    page === i + 1
                      ? "bg-[#4361EE] text-white"
                      : "hover:bg-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create task modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#0F172A]">Шинэ даалгавар үүсгэх</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Гарчиг <span className="text-[#C0504D]">*</span></label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Даалгаврын гарчиг..."
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Төрөл <span className="text-[#C0504D]">*</span></label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all appearance-none"
                  >
                    {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Ач холбогдол</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all appearance-none"
                  >
                    <option value="high">Өндөр</option>
                    <option value="medium">Дунд</option>
                    <option value="low">Бага</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#64748B]">
                    Сурагч {!allStudents && <span className="text-[#C0504D]">*</span>}
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allStudents}
                      onChange={e => setAllStudents(e.target.checked)}
                      className="rounded border-[#E2E8F0] accent-[#4361EE]"
                    />
                    <span className="text-xs text-[#64748B]">Бүх сурагчид ({students.length})</span>
                  </label>
                </div>
                {!allStudents && (
                  <select
                    value={form.studentId}
                    onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all appearance-none"
                  >
                    <option value="">Сурагч сонгох...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                {allStudents && (
                  <div className="w-full border border-[#4361EE] bg-[#EEF1FD] rounded-xl px-3 py-2.5 text-sm text-[#3451D1] font-medium">
                    Бүх {students.length} сурагчид даалгавар үүсгэнэ
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Дуусах огноо <span className="text-[#C0504D]">*</span></label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Тайлбар</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Нэмэлт мэдээлэл..."
                  rows={3}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                Цуцлах
              </button>
              <button
                onClick={submitTask}
                disabled={submitting || !form.title || !form.deadline || (!allStudents && !form.studentId)}
                className="flex-1 py-2.5 rounded-xl bg-[#4361EE] text-white text-sm font-medium hover:bg-[#3451D1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Хадгалж байна..." : "Үүсгэх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
