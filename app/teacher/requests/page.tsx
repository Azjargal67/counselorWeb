"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Mail, Building2, Calendar, Search,
  Check, X, PenLine, Clock,
  GraduationCap, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "all" | "pending" | "writing" | "sent" | "rejected"

interface RecommendationRequest {
  id: string; studentId: string; studentName: string
  teacherId: string; teacherName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; notes?: string; createdAt: string
}

const statusConfig = {
  pending:  { label: "Хүлээгдэж буй", color: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400"  },
  writing:  { label: "Бичиж байна",   color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-400"   },
  sent:     { label: "Илгээсэн",       color: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-400"  },
  rejected: { label: "Татгалзсан",    color: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-400"    },
}

const tabs: { key: Status; label: string }[] = [
  { key: "all",      label: "Бүгд"             },
  { key: "pending",  label: "Хүлээгдэж буй"    },
  { key: "writing",  label: "Бичиж байна"      },
  { key: "sent",     label: "Илгээсэн"          },
  { key: "rejected", label: "Татгалзсан"        },
]

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [activeTab, setActiveTab] = useState<Status>("all")
  const [search, setSearch]       = useState("")
  const [selected, setSelected]   = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
      .catch(console.error)
  }, [])

  const filtered = requests.filter(r => {
    const matchTab    = activeTab === "all" || r.status === activeTab
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

  const updateStatus = (id: string, status: "writing" | "sent" | "rejected") => {
    fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.request) setRequests(prev => prev.map(r => r.id === d.request.id ? d.request : r))
      })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Ирсэн хүсэлтүүд" />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left: List */}
        <div className="flex flex-col w-full max-w-xl border-r border-[#E2E8F0] bg-white">
          {/* Toolbar */}
          <div className="p-4 space-y-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Сурагч, сургуулиар хайх..."
                className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    activeTab === t.key
                      ? "bg-[#4361EE] text-white"
                      : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                  )}
                >
                  {t.label}
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    activeTab === t.key ? "bg-white/30" : "bg-[#E2E8F0] text-[#6B6460]"
                  )}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Request cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#64748B] text-sm">
                <Mail className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />
                Хүсэлт олдсонгүй
              </div>
            )}
            {filtered.map(req => {
              const cfg  = statusConfig[req.status]
              const days = deadlineDays(req.deadline)
              const isSelected = selected === req.id
              return (
                <button
                  key={req.id}
                  onClick={() => setSelected(req.id === selected ? null : req.id)}
                  className={cn(
                    "w-full text-left px-5 py-4 hover:bg-[#F8FAFC] transition-colors",
                    isSelected && "bg-[#F0F3FF]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-semibold">{req.studentName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-semibold text-[#0F172A]">{req.studentName}</p>
                        <span className={cn("text-xs border px-2 py-0.5 rounded-full font-medium", cfg.color)}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{req.school}</span>
                        <span className={cn("flex items-center gap-1", days <= 7 && days > 0 ? "text-[#C0504D] font-semibold" : "")}>
                          <Clock className="w-3 h-3" />
                          {days > 0 ? `${days} хоног үлдсэн` : "Хугацаа дууссан"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2 text-left">{req.message}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedReq ? (
            <>
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{selectedReq.studentName} — {selectedReq.school}</p>
                  <p className="text-xs text-[#64748B]">
                    Дедлайн: {selectedReq.deadline?.split("T")[0]} · {deadlineDays(selectedReq.deadline)} хоног үлдсэн
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {selectedReq.status === "pending" && (
                    <button
                      onClick={() => updateStatus(selectedReq.id, "writing")}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#4361EE] hover:bg-[#8FA3D8] text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5" /> Бичиж эхлэх
                    </button>
                  )}
                  {selectedReq.status === "writing" && (
                    <button
                      onClick={() => updateStatus(selectedReq.id, "sent")}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A8C4D] hover:bg-[#3A6C3D] text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Илгээх
                    </button>
                  )}
                  {(selectedReq.status === "pending" || selectedReq.status === "writing") && (
                    <button
                      onClick={() => updateStatus(selectedReq.id, "rejected")}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#C0504D] bg-[#FCE8E8] hover:bg-[#F8D0D0] px-3 py-2 rounded-xl transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Татгалзах
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F8FAFC]">
                {/* Student info card */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-4">Сурагчийн мэдээлэл</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4361EE] flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{selectedReq.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{selectedReq.studentName}</p>
                        <p className="text-xs text-[#64748B]">Монгол сургууль</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-[#64748B]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Сургууль</p>
                        <p className="text-sm font-medium text-[#0F172A]">{selectedReq.school}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#64748B]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Дедлайн</p>
                        <p className="text-sm font-medium text-[#0F172A]">{selectedReq.deadline?.split("T")[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <div>
                        <p className="text-xs text-[#64748B]">Хүсэлт ирсэн</p>
                        <p className="text-sm font-medium text-[#0F172A]">{selectedReq.createdAt?.split("T")[0]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student's note */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-[#64748B]" />
                    <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Сурагчийн захиас</h3>
                  </div>
                  <p className="text-sm text-[#0F172A] leading-relaxed italic">"{selectedReq.message}"</p>
                </div>

                {/* Letter editor */}
                {(selectedReq.status === "pending" || selectedReq.status === "writing") && (
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <PenLine className="w-4 h-4 text-[#3451D1]" />
                        <h3 className="text-sm font-semibold text-[#0F172A]">Захидал бичих</h3>
                      </div>
                      <span className="text-xs text-[#64748B]">Хадгалагдаагүй</span>
                    </div>
                    <div className="p-5">
                      <textarea
                        defaultValue={selectedReq.status === "writing"
                          ? `To the Admissions Committee of ${selectedReq.school},\n\nIt is my great pleasure to recommend ${selectedReq.studentName} for admission to your distinguished institution...\n\n`
                          : ""}
                        placeholder={`Dear Admissions Committee at ${selectedReq.school},\n\nIt is my great pleasure to recommend...`}
                        rows={12}
                        className="w-full text-sm text-[#0F172A] leading-relaxed border border-[#E2E8F0] rounded-xl p-4 outline-none resize-none focus:border-[#4361EE] transition-colors bg-[#F8FAFC] placeholder-[#C8C4BE]"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-[#64748B]">Word count: 0 / 650 зөвлөмж болгон</span>
                        <div className="flex gap-2">
                          <button className="text-xs text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3 py-1.5 rounded-lg transition-colors">
                            Загвар ашиглах
                          </button>
                          <button className="text-xs font-medium bg-[#1E2540] hover:bg-[#2C3655] text-white px-4 py-1.5 rounded-lg transition-colors">
                            Хадгалах
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sent state */}
                {selectedReq.status === "sent" && (
                  <div className="bg-[#DFEDE0] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#4A8C4D] flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2A5C2D]">Захидал амжилттай илгээгдсэн</p>
                      <p className="text-sm text-[#4A8C4D]">{selectedReq.school}-д илгээгдсэн.</p>
                    </div>
                  </div>
                )}

                {/* Rejected state */}
                {selectedReq.status === "rejected" && (
                  <div className="bg-[#FCE8E8] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C0504D] flex items-center justify-center flex-shrink-0">
                      <X className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#8B1A1A]">Хүсэлт татгалзагдсан</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#EEF1FD] flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-[#4361EE]" />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1">Хүсэлт сонгоно уу</p>
              <p className="text-sm text-[#64748B]">Зүүн талаас хүсэлт сонгон дэлгэрэнгүй харж, захидал бичнэ үү.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
