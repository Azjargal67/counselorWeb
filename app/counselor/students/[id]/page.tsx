"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AppTopbar } from "@/components/app-topbar"
import { StatusBadge } from "@/components/status-badge"
import {
  MessageSquare, ClipboardList, ArrowLeft, Star,
  Plus, X, ChevronDown, Calendar, FileText,
  BookOpen, BarChart2, StickyNote, GraduationCap,
  CheckCircle2, Circle, AlertCircle, Edit2, Download,
  Target, Trophy, MapPin, Clock, XCircle
} from "lucide-react"
import Link from "next/link"

interface Student {
  id: string; name: string; grade?: string; email?: string
  phone?: string; gpa?: number; sat?: number; status: string
  school?: string
}

interface Task {
  id: string; title: string; description: string; category: string
  status: string; deadline: string; priority: string; progress: number; notes?: string
}

interface Document {
  id: string; name: string; type: string; size?: string
  category: string; version?: string; createdAt: string
}

const TABS = [
  { key: "overview", label: "Ерөнхий", icon: BarChart2 },
  { key: "tasks", label: "Даалгавар", icon: ClipboardList },
  { key: "documents", label: "Материал", icon: FileText },
  { key: "academic", label: "Академик", icon: BookOpen },
  { key: "admissions", label: "Тэнцэлт", icon: Trophy },
  { key: "notes", label: "Тэмдэглэл", icon: StickyNote },
  { key: "chat", label: "Чат", icon: MessageSquare },
]

const categoryLabel: Record<string, string> = {
  essay: "Essay", cv: "CV", transcript: "Transcript",
  recommendation: "Recommendation", "test-prep": "Шалгалт бэлтгэл",
  interview: "Интервью", other: "Бусад",
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

// ─── Create Task Modal ────────────────────────────────────────────────────────
function CreateTaskModal({ studentId, studentName, onClose, onCreated }: {
  studentId: string; studentName: string; onClose: () => void; onCreated: (task: Task) => void
}) {
  const [modalTab, setModalTab] = useState<"general" | "extra">("general")
  const [form, setForm] = useState({
    title: "", category: "essay", deadline: "", priority: "medium", description: "",
    notes: "", reminder: false,
  })

  const handleCreate = () => {
    if (!form.title || !form.deadline) return
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, studentId, progress: 0 }),
    })
      .then(r => r.json())
      .then(d => { if (d.task) { onCreated(d.task); onClose() } })
      .catch(console.error)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div>
            <h2 className="font-bold text-[#0F172A] text-lg">Шинэ даалгавар нэмэх</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <div className="flex border-b border-[#E2E8F0] px-6 pt-2">
          {(["general", "extra"] as const).map(t => (
            <button
              key={t}
              onClick={() => setModalTab(t)}
              className={`pb-2.5 text-sm font-medium mr-6 border-b-2 transition-colors ${
                modalTab === t
                  ? "border-[#4361EE] text-[#3451D1]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {t === "general" ? "Ерөнхий" : "Нэмэлт"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {modalTab === "general" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Даалгаврын нэр *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Жишээ нь: Common App Essay бичих..."
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#4361EE] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Төрөл</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] bg-white cursor-pointer"
                    >
                      <option value="essay">Essay</option>
                      <option value="cv">CV</option>
                      <option value="transcript">Transcript</option>
                      <option value="recommendation">Recommendation</option>
                      <option value="test-prep">Шалгалт бэлтгэл</option>
                      <option value="interview">Интервью</option>
                      <option value="other">Бусад</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Ач холбогдол</label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full appearance-none border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] bg-white cursor-pointer"
                    >
                      <option value="high">Өндөр</option>
                      <option value="medium">Дунд</option>
                      <option value="low">Бага</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Тайлбар</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Даалгаврын дэлгэрэнгүй тайлбар..."
                  rows={3}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#4361EE] transition-colors resize-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-[#0F172A] block mb-1.5">Зөвлөхийн тэмдэглэл</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Энэ даалгавартай холбоотой нэмэлт тэмдэглэл..."
                rows={3}
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#4361EE] transition-colors resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E2E8F0]">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            Цуцлах
          </button>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#4361EE] text-white hover:bg-[#8FA3D8] transition-colors">
            Нэмэх
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab Contents ─────────────────────────────────────────────────────────────

function OverviewTab({ student, tasks }: { student: Student; tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h4 className="font-semibold text-[#0F172A] mb-3">Ерөнхий мэдээлэл</h4>
          <div className="space-y-2.5">
            {[
              { label: "Имэйл", value: student.email ?? "—" },
              { label: "Утас", value: student.phone ?? "—" },
              { label: "Сургууль", value: student.school ?? "—" },
              { label: "Анги", value: student.grade ?? "—" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">{item.label}</span>
                <span className="font-medium text-[#0F172A]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h4 className="font-semibold text-[#0F172A] mb-3">Сүүлийн даалгаврууд</h4>
          <div className="space-y-2.5">
            {tasks.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center gap-3">
                {t.status === "done" ? <CheckCircle2 className="w-4 h-4 text-[#4A8C4D] flex-shrink-0" />
                  : t.status === "overdue" ? <AlertCircle className="w-4 h-4 text-[#C0504D] flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-[#E2E8F0] flex-shrink-0" />}
                <span className="text-sm text-[#0F172A] flex-1 truncate">{t.title}</span>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {tasks.length === 0 && <p className="text-xs text-[#64748B]">Даалгавар байхгүй</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TasksTab({ tasks, onAddTask }: { tasks: Task[]; onAddTask: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0]">
      <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
        <h4 className="font-semibold text-[#0F172A]">Бүх даалгаврууд ({tasks.length})</h4>
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#8FA3D8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Нэмэх
        </button>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {tasks.map(t => (
          <div key={t.id} className="flex items-start gap-4 p-4 hover:bg-[#F8FAFC] transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              t.status === "done" ? "bg-[#B8D8BA]" :
              t.status === "overdue" ? "bg-[#F4C2C2]" :
              t.status === "in-progress" ? "bg-[#4361EE]" : "bg-[#E2E8F0]"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A]">{t.title}</p>
              <p className="text-xs text-[#64748B] mt-0.5 truncate">{t.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-[#EEF1FD] text-[#3451D1] px-2 py-0.5 rounded-full">{categoryLabel[t.category] ?? t.category}</span>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{t.deadline?.split("T")[0]}
                </span>
                <StarRating value={Math.ceil(t.progress / 20)} />
              </div>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-[#64748B] text-center py-8">Даалгавар байхгүй</p>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ documents }: { documents: Document[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0]">
      <div className="p-5 border-b border-[#E2E8F0]">
        <h4 className="font-semibold text-[#0F172A]">Материалууд ({documents.length})</h4>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {documents.map(d => (
          <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-[#F8FAFC] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EEF1FD] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#3451D1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{d.name}</p>
              <p className="text-xs text-[#64748B]">{d.category} · {d.size ?? ""}{d.size ? " · " : ""}{d.createdAt?.split("T")[0]}</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-[#EEF1FD] transition-colors">
              <Download className="w-4 h-4 text-[#3451D1]" />
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-[#64748B] text-center py-8">Материал байхгүй</p>
        )}
      </div>
    </div>
  )
}

function AcademicTab({ student }: { student: Student }) {
  const subjects = [
    { name: "Математик", grade: "A", gpa: 4.0, credits: 4 },
    { name: "Физик", grade: "A-", gpa: 3.7, credits: 3 },
    { name: "Англи хэл", grade: "A", gpa: 4.0, credits: 3 },
    { name: "Хими", grade: "B+", gpa: 3.3, credits: 3 },
    { name: "Түүх", grade: "A-", gpa: 3.7, credits: 2 },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "GPA", value: student.gpa ?? "—", sub: "4.0-оос", color: "bg-[#EEF1FD] text-[#3451D1]" },
          { label: "SAT", value: student.sat ?? "—", sub: "1600-аас", color: "bg-[#DFEDE0] text-[#4A8C4D]" },
          { label: "Анги", value: student.grade ?? "—", sub: "", color: "bg-[#FDF4D9] text-[#B8860B]" },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 text-center">
            <p className="text-2xl font-bold text-[#0F172A]">{item.value}</p>
            {item.sub && <p className="text-xs text-[#64748B] mt-0.5">{item.sub}</p>}
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${item.color}`}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E2E8F0]">
        <div className="p-5 border-b border-[#E2E8F0]">
          <h4 className="font-semibold text-[#0F172A]">Хичээлүүд</h4>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {["Хичээл", "Дүн", "GPA", "Кредит"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {subjects.map(s => (
              <tr key={s.name} className="hover:bg-[#F8FAFC]">
                <td className="px-5 py-3 font-medium text-[#0F172A]">{s.name}</td>
                <td className="px-5 py-3">
                  <span className="bg-[#EEF1FD] text-[#3451D1] px-2.5 py-0.5 rounded-full text-xs font-semibold">{s.grade}</span>
                </td>
                <td className="px-5 py-3 text-[#0F172A]">{s.gpa}</td>
                <td className="px-5 py-3 text-[#64748B]">{s.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NotesTab() {
  const [note, setNote] = useState("")
  const savedNotes = [
    { date: "2026-04-22", text: "Common App эссэний 3-р хувилбар маш сайн болжээ. Зөвхөн дүгнэлтийн хэсгийг засах шаардлагатай." },
    { date: "2026-04-15", text: "SAT бэлтгэлд нэмэлт материал өгсөн. Khan Academy-ийн курс дуусгахыг хүссэн." },
  ]
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h4 className="font-semibold text-[#0F172A] mb-3">Шинэ тэмдэглэл</h4>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Тэмдэглэлээ бичнэ үү..."
          rows={4}
          className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#4361EE] resize-none transition-colors"
        />
        <div className="flex justify-end mt-3">
          <button className="bg-[#4361EE] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#8FA3D8] transition-colors">
            Хадгалах
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {savedNotes.map((n, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748B]">{n.date}</span>
              <button className="p-1 rounded hover:bg-[#F8FAFC]">
                <Edit2 className="w-3.5 h-3.5 text-[#64748B]" />
              </button>
            </div>
            <p className="text-sm text-[#0F172A] leading-relaxed">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatTab({ student }: { student: Student }) {
  const [msg, setMsg] = useState("")
  const messages = [
    { from: "counselor", text: `Сайн байна уу, ${student.name}! Common App эссэний шинэ хувилбараа явуулаарай.`, time: "09:15" },
    { from: "student", text: "Сайн байна аа. Өнөөдөр орой явуулна.", time: "09:45" },
  ]
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] flex flex-col" style={{ height: 440 }}>
      <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#4361EE] flex items-center justify-center">
          <span className="text-white text-xs font-bold">{student.name.charAt(0)}</span>
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">{student.name}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "counselor" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2.5 ${
              m.from === "counselor" ? "bg-[#4361EE] text-white" : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]"
            }`}>
              <p className="text-sm leading-relaxed">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from === "counselor" ? "text-white/60" : "text-[#64748B]"}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[#E2E8F0] flex items-center gap-2">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Мессеж бичнэ үү..."
          className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] outline-none focus:border-[#4361EE]"
        />
        <button className="bg-[#4361EE] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#8FA3D8] transition-colors">
          Илгээх
        </button>
      </div>
    </div>
  )
}

interface AdmissionResult {
  id: string; schoolName: string; country: string
  status: "accepted" | "waitlisted" | "rejected" | "deferred"
  scholarshipPercent: number; scholarshipAmount: number; currency: string
  major: string; notes: string; resultDate: string
}

const ADMIT_STATUS = {
  accepted:   { label: "Тэнцсэн",     color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]", icon: CheckCircle2 },
  waitlisted: { label: "Хүлээлгэнд",  color: "text-[#B8860B]", bg: "bg-[#FDF4D9]", icon: Clock        },
  rejected:   { label: "Татгалзсан",  color: "text-[#C0504D]", bg: "bg-[#FCE8E8]", icon: XCircle      },
  deferred:   { label: "Хойшлогдсон", color: "text-[#3451D1]", bg: "bg-[#EEF1FD]", icon: Clock        },
}
const CSYMBOL: Record<string, string> = { MNT: "₮", USD: "$", GBP: "£", AUD: "A$", KRW: "₩" }

function AdmissionsTab({ studentId }: { studentId: string }) {
  const [results, setResults] = useState<AdmissionResult[]>([])
  useEffect(() => {
    fetch(`/api/admissions?studentId=${studentId}`)
      .then(r => r.json())
      .then(d => setResults(d.admissions ?? []))
  }, [studentId])

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
        <Trophy className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#0F172A]">Одоогоор мэдээлэл байхгүй</p>
        <p className="text-xs text-[#64748B] mt-1">Сурагч элсэлтийн үр дүнгээ оруулаагүй байна</p>
      </div>
    )
  }

  const acceptedCount = results.filter(r => r.status === "accepted").length
  const totalMNT = results.filter(r => r.status === "accepted" && r.currency === "MNT").reduce((s, r) => s + r.scholarshipAmount, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт бүртгэл", value: results.length, color: "text-[#0F172A]" },
          { label: "Тэнцсэн", value: acceptedCount, color: "text-[#4A8C4D]" },
          { label: "Нийт тэтгэлэг", value: `₮${totalMNT.toLocaleString()}`, color: "text-[#3451D1]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-[#0F172A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="divide-y divide-[#E2E8F0]">
          {results.map(r => {
            const s = ADMIT_STATUS[r.status]
            const Icon = s.icon
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EEF1FD] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#3451D1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A]">{r.schoolName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#64748B]">
                    <MapPin className="w-3 h-3" /><span>{r.country}</span>
                    {r.major && <><span>·</span><span>{r.major}</span></>}
                  </div>
                </div>
                {r.status === "accepted" && r.scholarshipPercent > 0 && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#B8860B]">{r.scholarshipPercent}%</p>
                    {r.scholarshipAmount > 0 && (
                      <p className="text-xs text-[#4A8C4D] font-semibold">{CSYMBOL[r.currency]}{r.scholarshipAmount.toLocaleString()}</p>
                    )}
                  </div>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${s.bg} ${s.color}`}>
                  <Icon className="w-3 h-3" />{s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      fetch(`/api/users/${studentId}`).then(r => r.json()),
      fetch(`/api/tasks?studentId=${studentId}`).then(r => r.json()),
      fetch(`/api/documents?studentId=${studentId}`).then(r => r.json()),
    ]).then(([ud, td, dd]) => {
      setStudent(ud.user ?? null)
      setTasks(td.tasks ?? [])
      setDocuments(dd.documents ?? [])
    }).catch(console.error)
  }, [studentId])

  if (!student) {
    return (
      <div className="flex flex-col min-h-full">
        <AppTopbar title="Сурагч" breadcrumb={["Counselor", "Сурагчид"]} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#64748B]">Уншиж байна...</p>
        </div>
      </div>
    )
  }

  const tasksDone = tasks.filter(t => t.status === "done").length
  const progress = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title={student.name} breadcrumb={["Counselor", "Сурагчид"]} />

      {showModal && (
        <CreateTaskModal
          studentId={studentId}
          studentName={student.name}
          onClose={() => setShowModal(false)}
          onCreated={task => setTasks(prev => [...prev, task])}
        />
      )}

      <div className="flex-1 p-6 space-y-5">
        {/* Student header card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow p-6">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-[#4361EE] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{student.name.charAt(0)}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${student.status === "active" ? "bg-[#4A8C4D]" : "bg-[#C8C4BE]"}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">{student.name}</h2>
                  <p className="text-sm text-[#64748B] mt-0.5">{student.grade ?? "—"} · {student.school ?? "—"}</p>
                  <p className="text-sm text-[#64748B] mt-0.5">{student.email ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href="/counselor/chat"
                    className="flex items-center gap-2 border border-[#E2E8F0] text-[#0F172A] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Чат
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 border border-[#E2E8F0] text-[#0F172A] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Даалгавар
                  </button>
                  <Link
                    href="/counselor/students"
                    className="flex items-center gap-2 border border-[#E2E8F0] text-[#0F172A] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Буцах
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E2E8F0]">
                {[
                  { label: "GPA", value: student.gpa ?? "—", color: "text-[#3451D1]" },
                  { label: "SAT", value: student.sat ?? "—", color: "text-[#4A8C4D]" },
                ].map(s => (
                  <div key={s.label} className="text-center px-4 border-r border-[#E2E8F0] last:border-0">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-[#64748B]">{s.label}</p>
                  </div>
                ))}
                <div className="flex-1 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B]">Ерөнхий явц</span>
                    <span className="text-xs font-bold text-[#3451D1]">{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#EEF1FD] rounded-full">
                    <div className="h-2 bg-[#4361EE] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <Target className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm font-semibold text-[#0F172A]">{tasksDone}/{tasks.length}</span>
                  <span className="text-xs text-[#64748B]">даалгавар</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E2E8F0] p-1.5 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[#4361EE] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {activeTab === "overview"   && <OverviewTab student={student} tasks={tasks} />}
        {activeTab === "tasks"      && <TasksTab tasks={tasks} onAddTask={() => setShowModal(true)} />}
        {activeTab === "documents"  && <DocumentsTab documents={documents} />}
        {activeTab === "academic"   && <AcademicTab student={student} />}
        {activeTab === "admissions" && <AdmissionsTab studentId={studentId} />}
        {activeTab === "notes"      && <NotesTab />}
        {activeTab === "chat"       && <ChatTab student={student} />}
      </div>
    </div>
  )
}
