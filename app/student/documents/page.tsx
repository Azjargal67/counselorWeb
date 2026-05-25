"use client"

import { useState, useEffect, useRef } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  Upload, FileText, Eye, Download, Trash2,
  Search, File, Image, X, CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

type DocCategory = "all" | "Essay" | "CV" | "Transcript" | "Recommendation" | "Бусад"

interface Document {
  id: string; name: string; type: string; size?: string
  category: string; version?: string; url?: string; createdAt: string
}

const categories: DocCategory[] = ["all", "Essay", "CV", "Transcript", "Recommendation", "Бусад"]
const uploadCategories = ["Essay", "CV", "Transcript", "Recommendation", "Бусад"]

const categoryLabels: Record<DocCategory, string> = {
  all: "Бүгд", Essay: "Essay", CV: "CV", Transcript: "Transcript",
  Recommendation: "Recommendation", Бусад: "Бусад",
}

function getFileExt(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? ""
}

function FileIcon({ name, url, className }: { name: string; url?: string; className?: string }) {
  const ext = getFileExt(name)
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)

  if (isImage && url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className={cn("object-cover rounded-lg", className)} />
    )
  }

  const config: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
    pdf:  { label: "PDF",  bg: "bg-red-50",    color: "text-red-600",    icon: FileText },
    doc:  { label: "DOC",  bg: "bg-blue-50",   color: "text-blue-600",   icon: FileText },
    docx: { label: "DOCX", bg: "bg-blue-50",   color: "text-blue-600",   icon: FileText },
    txt:  { label: "TXT",  bg: "bg-gray-50",   color: "text-gray-600",   icon: FileText },
    jpg:  { label: "IMG",  bg: "bg-purple-50", color: "text-purple-600", icon: Image },
    jpeg: { label: "IMG",  bg: "bg-purple-50", color: "text-purple-600", icon: Image },
    png:  { label: "IMG",  bg: "bg-purple-50", color: "text-purple-600", icon: Image },
  }

  const c = config[ext] ?? { label: ext.toUpperCase() || "FILE", bg: "bg-[#E2E8F0]", color: "text-[#64748B]", icon: File }
  const Icon = c.icon

  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg", c.bg, className)}>
      <Icon className={cn("w-6 h-6 mb-1", c.color)} />
      <span className={cn("text-[10px] font-bold", c.color)}>{c.label}</span>
    </div>
  )
}

export default function StudentDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [activeCategory, setActiveCategory] = useState<DocCategory>("all")
  const [search, setSearch] = useState("")
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingCategory, setPendingCategory] = useState("Бусад")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(d => setDocs(d.documents ?? []))
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    setPendingFile(files[0])
    setPendingCategory("Бусад")
  }

  const uploadFile = async () => {
    if (!pendingFile) return
    setUploading(true)
    setUploadProgress(`"${pendingFile.name}" байршуулж байна...`)
    const form = new FormData()
    form.append("file", pendingFile)
    form.append("category", pendingCategory)
    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: form })
      const data = await res.json()
      if (data.document) {
        setDocs(prev => [data.document, ...prev])
        setUploadProgress("")
        setPendingFile(null)
      } else {
        setUploadProgress(data.error ?? "Алдаа гарлаа")
        setTimeout(() => setUploadProgress(""), 3000)
      }
    } catch {
      setUploadProgress("Алдаа гарлаа")
      setTimeout(() => setUploadProgress(""), 3000)
    }
    setUploading(false)
  }

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

        {/* Pending file — category select + confirm */}
        {pendingFile && (
          <div className="bg-[#EEF1FD] border border-[#4361EE] rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <FileIcon name={pendingFile.name} className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{pendingFile.name}</p>
              <p className="text-xs text-[#64748B]">{(pendingFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <select value={pendingCategory} onChange={e => setPendingCategory(e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-[#4361EE]">
              {uploadCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={uploadFile} disabled={uploading}
              className="flex items-center gap-1.5 bg-[#4361EE] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#3451D1] transition-colors disabled:opacity-60">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Байршуулж..." : "Байршуулах"}
            </button>
            <button onClick={() => setPendingFile(null)} className="p-1.5 rounded-lg hover:bg-[#D4DCEF] transition-colors">
              <X className="w-4 h-4 text-[#64748B]" />
            </button>
          </div>
        )}

        {/* Upload status */}
        {uploadProgress && (
          <div className={cn("flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl",
            uploadProgress.includes("Алдаа") ? "bg-red-50 text-red-600" : "bg-[#DFEDE0] text-[#2A5C2D]")}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {uploadProgress}
          </div>
        )}

        {/* Upload zone */}
        {!pendingFile && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
              dragging ? "border-[#4361EE] bg-[#EEF1FD]" : "border-[#E2E8F0] bg-white hover:border-[#4361EE] hover:bg-[#F8FAFC]"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF1FD] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#3451D1]" />
            </div>
            <p className="text-sm text-[#0F172A] font-medium">Файл чирж оруулах</p>
            <p className="text-xs text-[#64748B]">
              эсвэл <span className="text-[#3451D1] font-medium">сонгох</span> — PDF, DOCX, JPG (макс 10MB)
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>
        )}

        {/* Category tabs + search */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn("flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                  activeCategory === cat ? "bg-[#4361EE] border-[#4361EE] text-white" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]")}>
                {categoryLabels[cat]}
                <span className={cn("rounded-full px-1 text-xs", activeCategory === cat ? "bg-white/30" : "bg-[#E2E8F0]")}>
                  {counts[cat]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Хайх..."
              className="pl-8 pr-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:border-[#4361EE] transition-all w-48" />
          </div>
        </div>

        {/* File grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(doc => (
            <div key={doc.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-[#4361EE] hover:shadow-md transition-all group">
              {/* File preview */}
              <div className="mb-3">
                <FileIcon name={doc.name} url={doc.url} className="w-full h-24" />
              </div>

              {/* Info */}
              <p className="text-sm font-semibold text-[#0F172A] truncate mb-0.5" title={doc.name}>{doc.name}</p>
              <p className="text-xs text-[#64748B] mb-2">
                {doc.size ?? ""}{doc.size ? " · " : ""}{doc.createdAt?.split("T")[0]}
              </p>
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
                <a href={doc.url ?? "#"} target="_blank" rel="noreferrer"
                  title="Харах"
                  className={cn("flex-1 flex items-center justify-center p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#3451D1] transition-colors", !doc.url && "pointer-events-none opacity-30")}>
                  <Eye className="w-3.5 h-3.5" />
                </a>
                <a href={doc.url ?? "#"} download={doc.name}
                  title="Татах"
                  className={cn("flex-1 flex items-center justify-center p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#3451D1] transition-colors", !doc.url && "pointer-events-none opacity-30")}>
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button title="Устгах" onClick={() => deleteDoc(doc.id)}
                  className="flex-1 flex items-center justify-center p-1.5 rounded-lg hover:bg-[#F7DDDD] text-[#64748B] hover:text-[#C0504D] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !uploading && (
          <div className="py-16 text-center bg-white rounded-xl border border-[#E2E8F0]">
            <File className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">Файл олдсонгүй</p>
          </div>
        )}
      </div>
    </div>
  )
}
