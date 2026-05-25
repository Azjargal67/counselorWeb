"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  FileText, Search, Building2, Calendar,
  CheckCircle2, ChevronDown, Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationRequest {
  id: string; studentName: string; school: string
  deadline: string; status: string; message: string
  letterContent?: string; createdAt: string
}

type SortKey = "date" | "name" | "school"

export default function TeacherLettersPage() {
  const [allLetters, setAllLetters] = useState<RecommendationRequest[]>([])
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("date")
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setAllLetters((d.requests ?? []).filter((r: RecommendationRequest) => r.status === "sent")))
  }, [])

  const filtered = allLetters
    .filter(l => l.studentName.toLowerCase().includes(search.toLowerCase()) || l.school.toLowerCase().includes(search.toLowerCase()))
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
        <div className="flex flex-col w-full max-w-sm flex-shrink-0 border-r border-[#E2E8F0] bg-white">
          <div className="px-4 pt-4 pb-3 border-b border-[#E2E8F0] space-y-3">
            <div className="bg-[#DFEDE0] rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-[#2A5C2D]">{allLetters.length}</p>
              <p className="text-xs text-[#4A8C4D]">Нийт илгээсэн захидал</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх..."
                  className="bg-transparent text-sm text-[#0F172A] placeholder-[#64748B] outline-none w-full" />
              </div>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                  className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#0F172A] pr-7 outline-none cursor-pointer">
                  <option value="date">Огноо</option>
                  <option value="name">Нэр</option>
                  <option value="school">Сургууль</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748B] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {filtered.map(letter => (
              <button key={letter.id}
                onClick={() => setPreview(letter.id === preview ? null : letter.id)}
                className={cn("w-full text-left px-4 py-4 hover:bg-[#F8FAFC] transition-colors",
                  preview === letter.id && "bg-[#EDFAEE]")}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DFEDE0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-[#4A8C4D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{letter.studentName}</p>
                    <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{letter.school}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{letter.createdAt?.split("T")[0]}</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#4A8C4D] flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#64748B] text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#C8C4BE]" />Захидал олдсонгүй
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {previewLetter ? (
            <>
              <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-5 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{previewLetter.studentName} — {previewLetter.school}</p>
                  <p className="text-xs text-[#64748B]">Илгээсэн: {previewLetter.createdAt?.split("T")[0]}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
                  <div className="mb-6 pb-5 border-b border-[#E2E8F0]">
                    <p className="text-lg font-bold text-[#0F172A]">Recommendation Letter</p>
                    <p className="text-sm text-[#64748B] mt-1">For: <span className="font-medium text-[#0F172A]">{previewLetter.studentName}</span></p>
                    <p className="text-sm text-[#64748B]">To: <span className="font-medium text-[#0F172A]">{previewLetter.school}</span></p>
                    <p className="text-sm text-[#64748B]">Date: <span className="font-medium text-[#0F172A]">{previewLetter.createdAt?.split("T")[0]}</span></p>
                  </div>
                  {previewLetter.letterContent ? (
                    <pre className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans">
                      {previewLetter.letterContent}
                    </pre>
                  ) : (
                    <p className="text-sm text-[#64748B] italic">Захидлын агуулга олдсонгүй.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-[#C8C4BE]" />
              </div>
              <p className="font-semibold text-[#0F172A] mb-1">Захидал сонгоно уу</p>
              <p className="text-sm text-[#64748B]">Зүүн талаас захидал сонгон харна уу.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
