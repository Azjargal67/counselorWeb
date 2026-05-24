"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import {
  RefreshCw, MapPin, TrendingUp, Plus, Check,
  Award, Sparkles, AlertCircle, X, ExternalLink, Globe, GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SCHOOL_LIST, type SchoolData } from "@/lib/school-data"

type SchoolType = "safety" | "match" | "reach"
type SchoolWithAI = SchoolData & { type: SchoolType; matchConfidence: number; reasoning?: string }

const STORAGE_KEY = "student_schools_kanban"

const typeConfig = {
  safety: { label: "Safety", color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]", border: "border-[#B8D8BA]", badge: "bg-[#B8D8BA] text-[#4A8C4D]", bar: "#B8D8BA" },
  match:  { label: "Match",  color: "text-[#3451D1]", bg: "bg-[#EEF1FD]", border: "border-[#4361EE]", badge: "bg-[#4361EE] text-white",   bar: "#4361EE" },
  reach:  { label: "Reach",  color: "text-[#C07A8B]", bg: "bg-[#FDEEF3]", border: "border-[#F4C2C2]", badge: "bg-[#F4C2C2] text-[#C07A8B]", bar: "#F4C2C2" },
}

function SchoolLogo({ domain, name, color, size = "md" }: { domain: string; name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const [err, setErr] = useState(false)
  const initials = name.split(" ").filter(w => /^[A-Z]/.test(w)).slice(0, 3).map(w => w[0]).join("")
  const cls = size === "lg" ? "w-16 h-16 rounded-2xl text-base" : size === "sm" ? "w-8 h-8 rounded-lg text-xs" : "w-12 h-12 rounded-xl text-sm"

  if (err) return (
    <div style={{ backgroundColor: color }} className={cn(cls, "flex items-center justify-center text-white font-bold flex-shrink-0")}>{initials}</div>
  )
  return (
    <div className={cn(cls, "bg-white border border-[#E2E8F0] flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden")}>
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} alt={name} onError={() => setErr(true)} className="w-full h-full object-contain" />
    </div>
  )
}

function getSavedIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved).map((s: { id: string }) => s.id) : []
  } catch { return [] }
}

function addToList(school: SchoolWithAI): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const list = saved ? JSON.parse(saved) : []
    if (list.find((s: { id: string }) => s.id === school.id)) return false
    list.push({
      id: school.id, name: school.name, country: school.country,
      type: school.type, applicationStatus: "researching",
      ranking: school.ranking, matchConfidence: school.matchConfidence,
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch { return false }
}

export default function AIRecommendationsPage() {
  const [activeType, setActiveType] = useState<SchoolType>("match")
  const [schools, setSchools] = useState<SchoolWithAI[]>(
    SCHOOL_LIST.map(s => ({ ...s, type: "match" as SchoolType, matchConfidence: 50 }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState("")
  const [hasProfile, setHasProfile] = useState(false)
  const [selected, setSelected] = useState<SchoolWithAI | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => { setSavedIds(getSavedIds()) }, [])

  const fetchRecommendations = useCallback(async (profile: object) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSchools(SCHOOL_LIST.map(school => {
        const ai = data.schools?.find((r: { id: string }) => r.id === school.id)
        return ai
          ? { ...school, type: ai.type as SchoolType, matchConfidence: ai.matchConfidence, reasoning: ai.reasoning }
          : { ...school, type: "match" as SchoolType, matchConfidence: 50 }
      }))
      setSummary(data.summary || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI зөвлөмж авахад алдаа гарлаа.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem("studentAcademicProfile")
    if (raw) { setHasProfile(true); fetchRecommendations(JSON.parse(raw)) }
  }, [fetchRecommendations])

  const handleAdd = (school: SchoolWithAI) => {
    if (addToList(school)) setSavedIds(prev => [...prev, school.id])
  }

  const filtered = schools.filter(s => s.type === activeType)
  const counts = { safety: schools.filter(s => s.type === "safety").length, match: schools.filter(s => s.type === "match").length, reach: schools.filter(s => s.type === "reach").length }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="AI Зөвлөмж" breadcrumb={["Сурагч", "AI Зөвлөмж"]} />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary banner */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0 bg-[#EEF1FD] rounded-xl p-4 flex items-start gap-3">
            <Sparkles className={cn("w-5 h-5 text-[#3451D1] flex-shrink-0 mt-0.5", loading && "animate-pulse")} />
            <div>
              {loading ? (
                <>
                  <p className="text-sm font-semibold text-[#0F172A]">AI дүн шинжилгээ хийж байна...</p>
                  <p className="text-xs text-[#64748B]">Таны профайлыг сургуулиудтай харьцуулж байна. Хэдэн секунд хүлээнэ үү.</p>
                </>
              ) : summary ? (
                <>
                  <p className="text-sm font-semibold text-[#0F172A] mb-0.5">AI-н дүгнэлт</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">{summary}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#0F172A] mb-0.5">{hasProfile ? "Таны профайлд үндэслэсэн зөвлөмж" : "Демо өгөгдөл"}</p>
                  <p className="text-xs text-[#64748B]">
                    {hasProfile ? `Нийт ${schools.length} сургуулийг үнэлсэн.`
                      : <><Link href="/student/academic" className="text-[#3451D1] font-semibold hover:underline">Академик хэсэг</Link>-т мэдээллээ бөглөж AI зөвлөмж авна уу.</>}
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => { const raw = localStorage.getItem("studentAcademicProfile"); if (raw) fetchRecommendations(JSON.parse(raw)) }}
            disabled={loading || !hasProfile}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:border-[#4361EE] transition-colors disabled:opacity-50">
            <RefreshCw className={cn("w-4 h-4 text-[#3451D1]", loading && "animate-spin")} />
            Дахин тооцоолох
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Type tabs */}
        <div className="flex items-center gap-3">
          {(["safety", "match", "reach"] as SchoolType[]).map(type => {
            const cfg = typeConfig[type]
            return (
              <button key={type} onClick={() => setActiveType(type)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex-1 justify-center",
                  activeType === type ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-white border-[#E2E8F0] text-[#64748B]"
                )}>
                {cfg.label}
                <span className={cn("text-xs rounded-full px-2 py-0.5 font-bold",
                  activeType === type ? cfg.badge : "bg-[#E2E8F0] text-[#64748B]"
                )}>{counts[type]}</span>
              </button>
            )
          })}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E2E8F0]" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-[#E2E8F0] rounded w-3/4" /><div className="h-3 bg-[#E2E8F0] rounded w-1/2" /></div>
                </div>
                <div className="flex gap-2 mb-4">{[...Array(3)].map((_, j) => <div key={j} className="flex-1 h-12 bg-[#E2E8F0] rounded-lg" />)}</div>
                <div className="h-2 bg-[#E2E8F0] rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(school => {
              const cfg = typeConfig[school.type]
              const isSaved = savedIds.includes(school.id)
              return (
                <div key={school.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#4361EE] transition-all card-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <SchoolLogo domain={school.domain} name={school.name} color={school.brandColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#0F172A] text-sm leading-snug">{school.name}</h3>
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0", cfg.badge)}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[#64748B]">
                        <MapPin className="w-3 h-3" /><span>{school.location}</span>
                        <span className="text-[#E2E8F0]">·</span>
                        <TrendingUp className="w-3 h-3" /><span>#{school.ranking} дэлхийд</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {[["Элсэлт", `${school.admissionRate}%`], ["Avg GPA", `${school.avgGpa}`], ["Avg SAT", `${school.avgSat}`]].map(([label, val]) => (
                      <div key={label} className="flex-1 bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                        <p className="text-xs text-[#64748B]">{label}</p>
                        <p className="text-sm font-bold text-[#0F172A]">{val}</p>
                      </div>
                    ))}
                  </div>

                  {school.hasScholarship && (
                    <div className="flex items-center gap-2 bg-[#FDF4D9] rounded-lg px-3 py-2 mb-4">
                      <Award className="w-3.5 h-3.5 text-[#B8860B]" />
                      <p className="text-xs text-[#B8860B] font-medium">Тэтгэлэг · {school.scholarshipAmount}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[#64748B]">Тохиромжтой байдал</span>
                      <span className={cn("text-xs font-bold", cfg.color)}>{school.matchConfidence}%</span>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] rounded-full">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${school.matchConfidence}%`, backgroundColor: cfg.bar }} />
                    </div>
                  </div>

                  {school.reasoning && (
                    <div className="flex items-start gap-2 bg-[#F8FAFC] rounded-lg px-3 py-2.5 mb-4">
                      <Sparkles className="w-3.5 h-3.5 text-[#3451D1] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#64748B] leading-relaxed">{school.reasoning}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAdd(school)} disabled={isSaved}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                        isSaved ? "bg-[#DFEDE0] text-[#4A8C4D] cursor-default" : "bg-[#EEF1FD] text-[#3451D1] hover:bg-[#4361EE] hover:text-white"
                      )}>
                      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {isSaved ? "Нэмэгдсэн" : "Жагсаалтад нэмэх"}
                    </button>
                    <button onClick={() => setSelected(school)}
                      className="ml-auto flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#3451D1] transition-colors underline-offset-2 hover:underline">
                      Дэлгэрэнгүй →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white">
              <h2 className="font-bold text-[#0F172A] text-base truncate pr-4">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-[#F8FAFC] flex-shrink-0">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Logo + meta */}
              <div className="flex items-center gap-4">
                <SchoolLogo domain={selected.domain} name={selected.name} color={selected.brandColor} size="lg" />
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", typeConfig[selected.type].badge)}>
                      {typeConfig[selected.type].label}
                    </span>
                    <span className="text-xs text-[#64748B]">#{selected.ranking} дэлхийд</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#64748B]">
                    <MapPin className="w-3 h-3" /><span>{selected.location}</span>
                  </div>
                </div>
              </div>

              {/* Match confidence */}
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0F172A]">Тохиромжтой байдал</span>
                  <span className={cn("text-sm font-bold", typeConfig[selected.type].color)}>{selected.matchConfidence}%</span>
                </div>
                <div className="h-2.5 bg-[#E2E8F0] rounded-full mb-3">
                  <div className="h-2.5 rounded-full" style={{ width: `${selected.matchConfidence}%`, backgroundColor: typeConfig[selected.type].bar }} />
                </div>
                {selected.reasoning && (
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#3451D1] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#64748B] leading-relaxed">{selected.reasoning}</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Элсэлтийн мэдээлэл</p>
                <div className="grid grid-cols-3 gap-2">
                  {[["Элсэлтийн хувь", `${selected.admissionRate}%`], ["Avg GPA", `${selected.avgGpa}`], ["Avg SAT", `${selected.avgSat}`]].map(([label, val]) => (
                    <div key={label} className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-xs text-[#64748B]">{label}</p>
                      <p className="text-sm font-bold text-[#0F172A]">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarship */}
              {selected.hasScholarship && (
                <div className="flex items-center gap-3 bg-[#FDF4D9] rounded-xl px-4 py-3">
                  <Award className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#B8860B]">Тэтгэлэг боломжтой</p>
                    <p className="text-xs text-[#B8860B]/80">{selected.scholarshipAmount}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Сургуулийн тухай</p>
                <p className="text-xs text-[#64748B] leading-relaxed bg-[#F8FAFC] rounded-xl p-3">{selected.description}</p>
              </div>

              {/* Strengths */}
              <div>
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Хүчтэй хөтөлбөрүүд</p>
                <div className="flex flex-wrap gap-2">
                  {selected.strengths.map(s => (
                    <span key={s} className="text-xs bg-[#EEF1FD] text-[#3451D1] px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-4 py-3">
                <GraduationCap className="w-4 h-4 text-[#64748B]" />
                <div>
                  <p className="text-xs font-semibold text-[#0F172A]">Өргөдлийн хугацаа</p>
                  <p className="text-xs text-[#64748B]">{selected.deadline}</p>
                </div>
              </div>

              {/* External links */}
              <div className="flex flex-col gap-2">
                <a href={selected.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B] transition-colors">
                  <Globe className="w-4 h-4" /> Албан ёсны вэбсайт <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(selected.name)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] text-sm font-medium hover:border-[#4361EE] hover:text-[#3451D1] transition-colors">
                  Wikipedia <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-5 border-t border-[#E2E8F0]">
              <button
                onClick={() => { handleAdd(selected); setSelected(null) }}
                disabled={savedIds.includes(selected.id)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors",
                  savedIds.includes(selected.id)
                    ? "bg-[#DFEDE0] text-[#4A8C4D] cursor-default"
                    : "bg-[#4361EE] text-white hover:bg-[#3451D1]"
                )}>
                {savedIds.includes(selected.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {savedIds.includes(selected.id) ? "Жагсаалтанд нэмэгдсэн" : "Миний сургуулиудад нэмэх"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
