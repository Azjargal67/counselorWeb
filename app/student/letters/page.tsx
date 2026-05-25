"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import { FileText, Building2, Calendar, Clock, CheckCircle2, X, PenLine, Eye, Plus, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationRequest {
  id: string; teacherName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; letterContent?: string; createdAt: string
}

interface Teacher { id: string; name: string; email: string }

const statusConfig = {
  pending:  { label: "Хүлээгдэж буй", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  writing:  { label: "Бичиж байна",   color: "bg-blue-50 text-blue-700 border-blue-200",    icon: PenLine },
  sent:     { label: "Илгээсэн",       color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Татгалзсан",    color: "bg-red-50 text-red-700 border-red-200",       icon: X },
}

export default function StudentLettersPage() {
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [reqTeacherId, setReqTeacherId] = useState("")
  const [reqSchool, setReqSchool] = useState("")
  const [reqDeadline, setReqDeadline] = useState("")
  const [reqMessage, setReqMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
  }, [])

  useEffect(() => {
    if (showForm && teachers.length === 0) {
      fetch("/api/users?role=teacher")
        .then(r => r.json())
        .then(d => setTeachers((d.users ?? []).map((u: { _id: string; id?: string; name: string; email: string }) => ({ id: u._id ?? u.id, name: u.name, email: u.email }))))
    }
  }, [showForm, teachers.length])

  const selectedTeacher = teachers.find(t => t.id === reqTeacherId)

  const handleSend = async () => {
    if (!reqTeacherId || !reqSchool || !reqDeadline) {
      setSendError("Багш, сургууль, deadline заавал оруулна уу"); return
    }
    setSending(true); setSendError("")
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: reqTeacherId,
          teacherName: selectedTeacher?.name ?? "",
          school: reqSchool,
          deadline: reqDeadline,
          message: reqMessage,
        }),
      })
      const data = await res.json()
      if (data.request) {
        setRequests(prev => [data.request, ...prev])
        setShowForm(false)
        setReqTeacherId(""); setReqSchool(""); setReqDeadline(""); setReqMessage("")
      } else {
        setSendError(data.error ?? "Алдаа гарлаа")
      }
    } catch {
      setSendError("Алдаа гарлаа")
    }
    setSending(false)
  }

  const selectedReq = requests.find(r => r.id === selected)

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Recommendation захидал" />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* List */}
        <div className="flex flex-col w-full max-w-sm flex-shrink-0 border-r border-[#E2E8F0] bg-white">
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <p className="text-xs text-[#64748B]">Нийт {requests.length} хүсэлт</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-[#4361EE] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#3451D1] transition-colors">
              <Plus className="w-3.5 h-3.5" /> Шинэ хүсэлт
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {requests.length === 0 && (
              <div className="py-16 text-center text-[#64748B] text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />
                Хүсэлт байхгүй байна
              </div>
            )}
            {requests.map(req => {
              const cfg = statusConfig[req.status]
              const Icon = cfg.icon
              return (
                <button key={req.id} onClick={() => setSelected(req.id === selected ? null : req.id)}
                  className={cn("w-full text-left px-4 py-4 hover:bg-[#F8FAFC] transition-colors",
                    selected === req.id && "bg-[#F0F3FF]")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                      req.status === "sent" ? "bg-[#DFEDE0]" : req.status === "rejected" ? "bg-[#FCE8E8]" : "bg-[#EEF1FD]")}>
                      <Icon className={cn("w-4 h-4", req.status === "sent" ? "text-[#4A8C4D]" : req.status === "rejected" ? "text-[#C0504D]" : "text-[#4361EE]")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{req.school}</p>
                        <span className={cn("text-[10px] border px-1.5 py-0.5 rounded-full font-medium flex-shrink-0", cfg.color)}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate">{req.teacherName}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{req.createdAt?.split("T")[0]}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right detail */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {!selectedReq ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF1FD] flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[#4361EE]" />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1">Хүсэлт сонгоно уу</p>
              <p className="text-sm text-[#64748B]">Зүүн талаас хүсэлт сонгон захидлаа харна уу.</p>
            </div>
          ) : (
            <>
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-5">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{selectedReq.school}</p>
                  <p className="text-xs text-[#64748B]">{selectedReq.teacherName} · {selectedReq.deadline?.split("T")[0]}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Status card */}
                <div className={cn("rounded-xl border p-4 flex items-center gap-3", statusConfig[selectedReq.status].color)}>
                  {(() => { const Icon = statusConfig[selectedReq.status].icon; return <Icon className="w-5 h-5 flex-shrink-0" /> })()}
                  <div>
                    <p className="font-semibold text-sm">{statusConfig[selectedReq.status].label}</p>
                    <p className="text-xs mt-0.5">
                      {selectedReq.status === "pending" && "Багш таны хүсэлтийг хянаж байна."}
                      {selectedReq.status === "writing" && "Багш захидлыг бичиж байна, удахгүй ирнэ."}
                      {selectedReq.status === "sent" && "Багш захидлыг бичиж илгээсэн байна."}
                      {selectedReq.status === "rejected" && "Багш таны хүсэлтийг татгалзсан байна."}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#64748B]" />
                    <div><p className="text-xs text-[#64748B]">Сургууль</p><p className="text-sm font-medium text-[#0F172A]">{selectedReq.school}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#64748B]" />
                    <div><p className="text-xs text-[#64748B]">Deadline</p><p className="text-sm font-medium text-[#0F172A]">{selectedReq.deadline?.split("T")[0]}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#64748B]" />
                    <div><p className="text-xs text-[#64748B]">Багш</p><p className="text-sm font-medium text-[#0F172A]">{selectedReq.teacherName}</p></div>
                  </div>
                </div>

                {/* Letter content — only if sent */}
                {selectedReq.status === "sent" && selectedReq.letterContent && (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#DFEDE0] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4A8C4D]" />
                      <p className="text-sm font-semibold text-[#2A5C2D]">Recommendation Letter</p>
                    </div>
                    <div className="p-5">
                      <pre className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans">
                        {selectedReq.letterContent}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New request modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <p className="font-bold text-[#0F172A]">Тодорхойлох захидлын хүсэлт</p>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Teacher */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Багш сонгох</label>
                <select value={reqTeacherId} onChange={e => setReqTeacherId(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-white outline-none focus:border-[#4361EE] transition-colors">
                  <option value="">— Багш сонгоно уу —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Зорилтот сургуулийн нэр</label>
                <input value={reqSchool} onChange={e => setReqSchool(e.target.value)}
                  placeholder="жишээ: MIT, Harvard..."
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors" />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Deadline</label>
                <input type="date" value={reqDeadline} onChange={e => setReqDeadline(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors" />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Нэмэлт мэдээлэл (заавал биш)</label>
                <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)}
                  rows={3} placeholder="Захидалд онцлох зүйл байвал бичнэ үү..."
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors resize-none" />
              </div>

              {sendError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{sendError}</p>}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                Болих
              </button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4361EE] text-white text-sm font-semibold hover:bg-[#3451D1] transition-colors disabled:opacity-60">
                <Send className="w-3.5 h-3.5" />
                {sending ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
