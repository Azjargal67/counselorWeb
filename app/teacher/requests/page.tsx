"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Mail, Building2, Calendar, Search,
  Check, X, PenLine, Clock,
  GraduationCap, MessageSquare, Save, Send,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "all" | "pending" | "writing" | "sent" | "rejected"

interface RecommendationRequest {
  id: string; studentId: string; studentName: string
  teacherId: string; teacherName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; notes?: string; letterContent?: string; createdAt: string
}

const statusConfig = {
  pending:  { label: "Хүлээгдэж буй", color: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400"  },
  writing:  { label: "Бичиж байна",   color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-400"   },
  sent:     { label: "Илгээсэн",       color: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-400"  },
  rejected: { label: "Татгалзсан",    color: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-400"    },
}

const tabs: { key: Status; label: string }[] = [
  { key: "all",      label: "Бүгд"          },
  { key: "pending",  label: "Хүлээгдэж буй" },
  { key: "writing",  label: "Бичиж байна"   },
  { key: "sent",     label: "Илгээсэн"       },
  { key: "rejected", label: "Татгалзсан"    },
]

const TEMPLATE = (name: string, school: string) =>
`Dear Admissions Committee at ${school},

It is my great pleasure to recommend ${name} for admission to your distinguished institution. I have had the privilege of teaching ${name} over the past several years and can attest to their exceptional academic abilities and personal character.

Throughout our time together, ${name} has consistently demonstrated intellectual curiosity, strong analytical thinking, and a genuine passion for learning. They approach every challenge with diligence and creativity, making them one of the most outstanding students I have had the honor of teaching.

I am confident that ${name} will bring the same dedication and enthusiasm to ${school} and will make a significant positive impact on your academic community.

I recommend ${name} without reservation and believe they will excel in every endeavor at your institution.

Sincerely,`

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [activeTab, setActiveTab] = useState<Status>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [letterDraft, setLetterDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
      .catch(console.error)
  }, [])

  const filtered = requests.filter(r => {
    const matchTab = activeTab === "all" || r.status === activeTab
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
                        r.school.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts: Record<Status, number> = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    writing:  requests.filter(r => r.status === "writing").length,
    sent:     requests.filter(r => r.status === "sent").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  }

  const selectedReq = requests.find(r => r.id === selected)
  const deadlineDays = (dl: string) => Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000)

  const handleSelect = (req: RecommendationRequest) => {
    setSelected(req.id === selected ? null : req.id)
    setLetterDraft(req.letterContent || "")
    setSavedMsg("")
  }

  const patchReq = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const d = await res.json()
    if (d.request) setRequests(prev => prev.map(r => r.id === d.request.id ? d.request : r))
    return d.request
  }

  const handleApprove = async () => {
    if (!selectedReq) return
    await patchReq(selectedReq.id, { status: "writing" })
    setLetterDraft(TEMPLATE(selectedReq.studentName, selectedReq.school))
  }

  const handleReject = async () => {
    if (!selectedReq) return
    await patchReq(selectedReq.id, { status: "rejected" })
  }

  const handleSaveDraft = async () => {
    if (!selectedReq) return
    setSaving(true)
    await patchReq(selectedReq.id, { letterContent: letterDraft })
    setSaving(false)
    setSavedMsg("Хадгалагдлаа")
    setTimeout(() => setSavedMsg(""), 2000)
  }

  const handleSend = async () => {
    if (!selectedReq || !letterDraft.trim()) return
    setSending(true)
    await patchReq(selectedReq.id, { status: "sent", letterContent: letterDraft })
    setSending(false)
    setSavedMsg("")
  }

  const wordCount = letterDraft.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Ирсэн хүсэлтүүд" />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left: List */}
        <div className="flex flex-col w-full max-w-sm flex-shrink-0 border-r border-[#E2E8F0] bg-white">
          <div className="p-4 space-y-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Сурагч, сургуулиар хайх..."
                className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={cn("flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    activeTab === t.key ? "bg-[#4A8C4D] text-white" : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]")}>
                  {t.label}
                  <span className={cn("text-[10px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center",
                    activeTab === t.key ? "bg-white/30" : "bg-[#E2E8F0]")}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#64748B] text-sm">
                <Mail className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />Хүсэлт олдсонгүй
              </div>
            )}
            {filtered.map(req => {
              const cfg = statusConfig[req.status]
              const days = deadlineDays(req.deadline)
              return (
                <button key={req.id} onClick={() => handleSelect(req)}
                  className={cn("w-full text-left px-4 py-4 hover:bg-[#F8FAFC] transition-colors",
                    selected === req.id && "bg-[#EDFAEE]")}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#C07A8B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-semibold">{req.studentName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{req.studentName}</p>
                        <span className={cn("text-[10px] border px-1.5 py-0.5 rounded-full font-medium", cfg.color)}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate">{req.school}</p>
                      <p className={cn("text-xs mt-0.5", days <= 7 && days > 0 ? "text-[#C0504D] font-semibold" : "text-[#64748B]")}>
                        {days > 0 ? `${days} хоног үлдсэн` : "Хугацаа дууссан"}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Detail + Letter editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedReq ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EDFAEE] flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-[#4A8C4D]" />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1">Хүсэлт сонгоно уу</p>
              <p className="text-sm text-[#64748B]">Зүүн талаас хүсэлт сонгон захидал бичнэ үү.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-5 gap-3 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{selectedReq.studentName} — {selectedReq.school}</p>
                  <p className="text-xs text-[#64748B]">Deadline: {selectedReq.deadline?.split("T")[0]} · {deadlineDays(selectedReq.deadline)} хоног</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedReq.status === "pending" && (
                    <>
                      <button onClick={handleApprove}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A8C4D] hover:bg-[#3d7340] text-white px-3 py-2 rounded-xl transition-colors">
                        <Check className="w-3.5 h-3.5" /> Зөвшөөрөх
                      </button>
                      <button onClick={handleReject}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#C0504D] bg-[#FCE8E8] hover:bg-[#F8D0D0] px-3 py-2 rounded-xl transition-colors">
                        <X className="w-3.5 h-3.5" /> Татгалзах
                      </button>
                    </>
                  )}
                  {selectedReq.status === "writing" && (
                    <>
                      <button onClick={handleSaveDraft} disabled={saving}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#3451D1] bg-[#EEF1FD] hover:bg-[#D4DCEF] px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                        <Save className="w-3.5 h-3.5" /> {saving ? "Хадгалж..." : "Хадгалах"}
                      </button>
                      <button onClick={handleSend} disabled={sending || !letterDraft.trim()}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A8C4D] hover:bg-[#3d7340] text-white px-3 py-2 rounded-xl transition-colors disabled:opacity-60">
                        <Send className="w-3.5 h-3.5" /> {sending ? "Илгээж..." : "Илгээх"}
                      </button>
                      <button onClick={handleReject}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#C0504D] bg-[#FCE8E8] hover:bg-[#F8D0D0] px-3 py-2 rounded-xl transition-colors">
                        <X className="w-3.5 h-3.5" /> Татгалзах
                      </button>
                    </>
                  )}
                  {savedMsg && <span className="text-xs text-[#4A8C4D] font-medium">{savedMsg}</span>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
                {/* Info row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C07A8B] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{selectedReq.studentName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#64748B]">Сурагч</p>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{selectedReq.studentName}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#64748B]">Сургууль</p>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{selectedReq.school}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#64748B]">Deadline</p>
                      <p className="text-sm font-semibold text-[#0F172A]">{selectedReq.deadline?.split("T")[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Student message */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-[#64748B]" />
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Сурагчийн захиас</p>
                  </div>
                  <p className="text-sm text-[#0F172A] leading-relaxed italic">"{selectedReq.message}"</p>
                </div>

                {/* Letter editor — pending: preview only */}
                {selectedReq.status === "pending" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Хүлээгдэж байна</p>
                      <p className="text-xs text-amber-600 mt-0.5">Зөвшөөрвөл захидал бичих хэсэг нээгдэнэ.</p>
                    </div>
                  </div>
                )}

                {/* Letter editor — writing */}
                {selectedReq.status === "writing" && (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <div className="flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-[#4A8C4D]" />
                        <p className="text-sm font-semibold text-[#0F172A]">Recommendation Letter</p>
                      </div>
                      <span className="text-xs text-[#64748B]">{wordCount} үг</span>
                    </div>
                    <div className="p-4">
                      <textarea
                        value={letterDraft}
                        onChange={e => setLetterDraft(e.target.value)}
                        rows={16}
                        className="w-full text-sm text-[#0F172A] leading-relaxed border border-[#E2E8F0] rounded-xl p-4 outline-none resize-none focus:border-[#4A8C4D] transition-colors bg-[#FAFFFE] placeholder-[#C8C4BE] font-mono"
                        placeholder={`Dear Admissions Committee at ${selectedReq.school},\n\n...`}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => setLetterDraft(TEMPLATE(selectedReq.studentName, selectedReq.school))}
                          className="text-xs text-[#64748B] hover:text-[#4A8C4D] underline transition-colors">
                          Загвар ашиглах
                        </button>
                        <span className="text-xs text-[#94A3B8]">650 үг зөвлөмж болгон</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sent state */}
                {selectedReq.status === "sent" && (
                  <>
                    <div className="bg-[#DFEDE0] rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4A8C4D] flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2A5C2D]">Захидал амжилттай илгээгдсэн</p>
                        <p className="text-sm text-[#4A8C4D]">{selectedReq.school}-д илгээгдсэн.</p>
                      </div>
                    </div>
                    {selectedReq.letterContent && (
                      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-3">Илгээсэн захидал</p>
                        <pre className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans">{selectedReq.letterContent}</pre>
                      </div>
                    )}
                  </>
                )}

                {/* Rejected state */}
                {selectedReq.status === "rejected" && (
                  <div className="bg-[#FCE8E8] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C0504D] flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B1A1A]">Хүсэлт татгалзагдсан</p>
                      <p className="text-sm text-[#C0504D]">Сурагчид мэдэгдэл илгээгдсэн.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
