"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  FileText, Search, Download, Eye,
  Building2, Calendar, CheckCircle2,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationRequest {
  id: string; studentName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; createdAt: string
}

type SortKey = "date" | "name" | "school"

export default function TeacherLettersPage() {
  const [allLetters, setAllLetters] = useState<RecommendationRequest[]>([])
  const [search, setSearch]   = useState("")
  const [sort, setSort]       = useState<SortKey>("date")
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setAllLetters((d.requests ?? []).filter((r: RecommendationRequest) => r.status === "sent")))
      .catch(console.error)
  }, [])

  const filtered = allLetters
    .filter(l =>
      l.studentName.toLowerCase().includes(search.toLowerCase()) ||
      l.school.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "name")   return a.studentName.localeCompare(b.studentName)
      if (sort === "school") return a.school.localeCompare(b.school)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const previewLetter = allLetters.find(l => l.id === preview)

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Бичсэн захидлууд" />

      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* List */}
        <div className="flex flex-col w-full max-w-lg border-r border-[#E2E8F0] bg-white">
          {/* Header stats */}
          <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-[#DFEDE0] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#2A5C2D]">{allLetters.length}</p>
                <p className="text-xs text-[#4A8C4D]">Нийт захидал</p>
              </div>
              <div className="flex-1 bg-[#EEF1FD] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-[#0F172A]">—</p>
                <p className="text-xs text-[#3451D1]">Хүлээн авагдсан</p>
              </div>
              <div className="flex-1 bg-[#F8FAFC] rounded-xl px-4 py-3 text-center border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#0F172A]">—</p>
                <p className="text-xs text-[#64748B]">Дундаж хоног</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Хайх..."
                  className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full"
                />
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] pr-7 outline-none cursor-pointer"
                >
                  <option value="date">Огноо</option>
                  <option value="name">Нэр</option>
                  <option value="school">Сургууль</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748B] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Letter list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {filtered.map(letter => (
              <button
                key={letter.id}
                onClick={() => setPreview(letter.id === preview ? null : letter.id)}
                className={cn(
                  "w-full text-left px-5 py-4 hover:bg-[#F8FAFC] transition-colors",
                  preview === letter.id && "bg-[#F0F3FF]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DFEDE0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-[#4A8C4D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{letter.studentName}</p>
                    <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{letter.school}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{letter.createdAt?.split("T")[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#4A8C4D]" />
                    <span className="text-xs text-[#4A8C4D] font-medium">Илгээсэн</span>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#64748B] text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />
                Захидал олдсонгүй
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {previewLetter ? (
            <>
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{previewLetter.studentName} — {previewLetter.school}</p>
                  <p className="text-xs text-[#64748B]">Илгээсэн огноо: {previewLetter.createdAt?.split("T")[0]}</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium text-[#3451D1] bg-[#EEF1FD] hover:bg-[#D4DCEF] px-3 py-2 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Татах
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
                  <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-lg font-bold text-[#0F172A]">Recommendation Letter</p>
                        <p className="text-sm text-[#64748B]">For: <span className="font-medium text-[#0F172A]">{previewLetter.studentName}</span></p>
                        <p className="text-sm text-[#64748B]">To: <span className="font-medium text-[#0F172A]">{previewLetter.school}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#64748B]">Date</p>
                        <p className="text-sm font-medium text-[#0F172A]">{previewLetter.createdAt?.split("T")[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm text-[#0F172A] leading-relaxed space-y-4 text-sm">
                    <p>Dear Admissions Committee at {previewLetter.school},</p>
                    <p>
                      It is my great pleasure to recommend <strong>{previewLetter.studentName}</strong> for admission to your distinguished institution.
                      I have had the privilege of teaching {previewLetter.studentName} in Advanced Mathematics and Statistics over the past three years.
                    </p>
                    <p>
                      Throughout this time, {previewLetter.studentName} has consistently demonstrated exceptional analytical skills, intellectual curiosity,
                      and an unwavering commitment to academic excellence.
                    </p>
                    <p>
                      I strongly believe that {previewLetter.studentName} will excel academically and contribute meaningfully to your campus community.
                      I recommend them without reservation.
                    </p>
                    <p className="mt-6">
                      Sincerely,<br />
                      <strong>Дэлгэрмаа Чимэд</strong><br />
                      <span className="text-[#64748B]">Senior Mathematics Teacher</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[#C8C4BE]" />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1">Захидал сонгоно уу</p>
              <p className="text-sm text-[#64748B]">Зүүн талаас захидал сонгон урьдчилан харна уу.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
