"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Upload, FileText, Eye, Download, Trash2, History,
  Search, File
} from "lucide-react"
import { cn } from "@/lib/utils"

type DocCategory = "all" | "Essay" | "CV" | "Transcript" | "Recommendation" | "Бусад"

interface Document {
  id: string; name: string; type: string; size?: string
  category: string; version?: string; url?: string; createdAt: string
}

const categories: DocCategory[] = ["all", "Essay", "CV", "Transcript", "Recommendation", "Бусад"]

const categoryLabels: Record<DocCategory, string> = {
  all: "Бүгд", Essay: "Essay", CV: "CV", Transcript: "Transcript",
  Recommendation: "Recommendation", Бусад: "Бусад",
}

const typeIcon: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  essay: { icon: FileText, color: "text-[#3451D1]", bg: "bg-[#EEF1FD]" },
  cv: { icon: FileText, color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]" },
  transcript: { icon: FileText, color: "text-[#B8860B]", bg: "bg-[#FDF4D9]" },
  recommendation: { icon: FileText, color: "text-[#C0504D]", bg: "bg-[#F7DDDD]" },
  other: { icon: File, color: "text-[#64748B]", bg: "bg-[#E2E8F0]" },
}

export default function StudentDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [activeCategory, setActiveCategory] = useState<DocCategory>("all")
  const [search, setSearch] = useState("")
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.json())
      .then(d => setDocs(d.documents ?? []))
      .catch(console.error)
  }, [])

  const deleteDoc = async (id: string) => {
    if (!confirm("Энэ файлыг устгах уу?")) return
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
    if (res.ok) setDocs(prev => prev.filter(d => d.id !== id))
  }

  const filtered = docs.filter(doc => {
    const matchCat = activeCategory === "all" || doc.category === activeCategory
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const counts: Record<DocCategory, number> = {
    all: docs.length,
    Essay: docs.filter(d => d.category === "Essay").length,
    CV: docs.filter(d => d.category === "CV").length,
    Transcript: docs.filter(d => d.category === "Transcript").length,
    Recommendation: docs.filter(d => d.category === "Recommendation").length,
    Бусад: docs.filter(d => d.category === "Бусад").length,
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Материал" breadcrumb={["Сурагч", "Материал"]} />

      <div className="flex-1 p-6 space-y-5">
        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}
          className={cn(
            "border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
            dragging ? "border-[#4361EE] bg-[#EEF1FD]" : "border-[#E2E8F0] bg-white hover:border-[#4361EE] hover:bg-[#F8FAFC]"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-[#EEF1FD] flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#3451D1]" />
          </div>
          <p className="text-sm text-[#0F172A] font-medium">Файл чирж оруулах</p>
          <p className="text-xs text-[#64748B]">
            эсвэл <span className="text-[#3451D1] font-medium cursor-pointer hover:underline">сонгох</span> — PDF, DOCX, JPG (макс 10MB)
          </p>
        </div>

        {/* Category tabs + search */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                  activeCategory === cat
                    ? "bg-[#4361EE] border-[#4361EE] text-white"
                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]"
                )}
              >
                {categoryLabels[cat]}
                <span className={cn("rounded-full px-1 py-0.5 text-xs",
                  activeCategory === cat ? "bg-white/30" : "bg-[#E2E8F0]"
                )}>
                  {counts[cat]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="pl-8 pr-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all w-48"
            />
          </div>
        </div>

        {/* File grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(doc => {
            const { icon: Icon, color, bg } = typeIcon[doc.type] ?? typeIcon.other
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-[#4361EE] hover:shadow-md transition-all card-shadow group">
                {/* Icon + version */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  {doc.version && doc.version !== "v1" && (
                    <span className="text-xs bg-[#EEF1FD] text-[#3451D1] px-2 py-0.5 rounded-full font-medium">{doc.version}</span>
                  )}
                </div>

                {/* Info */}
                <p className="text-sm font-semibold text-[#0F172A] truncate mb-0.5">{doc.name}</p>
                <p className="text-xs text-[#64748B] mb-2">{doc.size ?? ""}{doc.size ? " · " : ""}{doc.createdAt?.split("T")[0]}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", {
                  "bg-[#EEF1FD] text-[#3451D1]": doc.category === "Essay",
                  "bg-[#DFEDE0] text-[#4A8C4D]": doc.category === "CV",
                  "bg-[#FDF4D9] text-[#B8860B]": doc.category === "Transcript",
                  "bg-[#F7DDDD] text-[#C0504D]": doc.category === "Recommendation",
                  "bg-[#E2E8F0] text-[#64748B]": doc.category === "Бусад",
                })}>
                  {doc.category}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#E2E8F0] opacity-0 group-hover:opacity-100 transition-opacity">
                  {[
                    { icon: Eye, title: "Харах" },
                    { icon: Download, title: "Татах" },
                    { icon: History, title: "Түүх" },
                    { icon: Trash2, title: "Устгах" },
                  ].map(({ icon: ActionIcon, title }) => (
                    <button key={title} title={title}
                      onClick={title === "Устгах" ? () => deleteDoc(doc.id) : undefined}
                      className={cn("flex-1 flex items-center justify-center p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors",
                        title === "Устгах" ? "hover:bg-[#F7DDDD] text-[#64748B] hover:text-[#C0504D]" : "text-[#64748B] hover:text-[#3451D1]"
                      )}>
                      <ActionIcon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white rounded-xl border border-[#E2E8F0]">
            <File className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">Файл олдсонгүй</p>
          </div>
        )}
      </div>
    </div>
  )
}
