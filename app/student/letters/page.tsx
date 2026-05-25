"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import { FileText, Building2, Calendar, Clock, CheckCircle2, X, PenLine, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationRequest {
  id: string; teacherName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; letterContent?: string; createdAt: string
}

const statusConfig = {
  pending:  { label: "Хүлээгдэж буй", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  writing:  { label: "Бичиж байна",   color: "bg-blue-50 text-blue-700 border-blue-200",    icon: PenLine },
  sent:     { label: "Илгээсэн",       color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Татгалзсан",    color: "bg-red-50 text-red-700 border-red-200",       icon: X },
}

export default function StudentLettersPage() {
  const [requests, setRequests] = useState<RecommendationRequest[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
  }, [])

  const selectedReq = requests.find(r => r.id === selected)

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Recommendation захидал" />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* List */}
        <div className="flex flex-col w-full max-w-sm flex-shrink-0 border-r border-[#E2E8F0] bg-white">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">Нийт {requests.length} хүсэлт</p>
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
    </div>
  )
}
