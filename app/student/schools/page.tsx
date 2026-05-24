"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
interface School { id: string; name: string; country: string; type: string; deadline?: string; applicationStatus?: KanbanStatus; ranking?: number; matchConfidence?: number }
import { Plus, BookOpen, Calendar, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

type KanbanStatus = "researching" | "applied" | "waiting" | "accepted" | "rejected"

const columns: { id: KanbanStatus; label: string; color: string; bg: string; border: string }[] = [
  { id: "researching", label: "Судалж буй", color: "text-[#3451D1]", bg: "bg-[#EEF1FD]", border: "border-[#4361EE]" },
  { id: "applied", label: "Илгээсэн", color: "text-[#B8860B]", bg: "bg-[#FDF4D9]", border: "border-[#F5D76E]" },
  { id: "waiting", label: "Хариу хүлээж буй", color: "text-[#64748B]", bg: "bg-[#E2E8F0]", border: "border-[#E2E8F0]" },
  { id: "accepted", label: "Тэнцсэн", color: "text-[#4A8C4D]", bg: "bg-[#DFEDE0]", border: "border-[#B8D8BA]" },
  { id: "rejected", label: "Татгалзсан", color: "text-[#C0504D]", bg: "bg-[#F7DDDD]", border: "border-[#E8A5A5]" },
]

const typeLabel: Record<string, string> = {
  safety: "Safety", match: "Match", reach: "Reach"
}
const typeColor: Record<string, string> = {
  safety: "bg-[#DFEDE0] text-[#4A8C4D]",
  match: "bg-[#EEF1FD] text-[#3451D1]",
  reach: "bg-[#F7DDDD] text-[#C0504D]",
}

const STORAGE_KEY = "student_schools_kanban"

export default function StudentSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<KanbanStatus | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setSchools(JSON.parse(saved))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(schools))
  }, [schools, loaded])

  const columnSchools = (colId: KanbanStatus) => schools.filter(s => s.applicationStatus === colId)

  const handleDragStart = (id: string) => setDragging(id)
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }
  const handleDrop = (colId: KanbanStatus) => {
    if (!dragging) return
    setSchools(prev => prev.map(s => s.id === dragging ? { ...s, applicationStatus: colId } : s))
    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Миний сургуулиуд" breadcrumb={["Сурагч", "Сургуулиуд"]} />

      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {columns.map(col => {
            const colSchools = columnSchools(col.id)
            return (
              <div
                key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
                onDrop={() => handleDrop(col.id)}
                onDragLeave={() => setDragOver(null)}
                className={cn(
                  "w-60 flex-shrink-0 flex flex-col rounded-xl border-2 transition-all self-start",
                  dragOver === col.id ? `${col.border} ${col.bg}` : "border-transparent bg-[#F2F0EC]"
                )}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", col.color)}>{col.label}</span>
                    <span className={cn("text-xs rounded-full px-2 py-0.5 font-bold", col.bg, col.color)}>
                      {colSchools.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="px-3 pb-3 space-y-3">
                  {colSchools.length === 0 && (
                    <div className={cn(
                      "h-10 rounded-lg border border-dashed transition-all",
                      dragOver === col.id ? `${col.border} ${col.bg}` : "border-[#D1D5DB]"
                    )} />
                  )}
                  {colSchools.map(school => (
                    <div
                      key={school.id}
                      draggable
                      onDragStart={() => handleDragStart(school.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "bg-white rounded-xl border border-[#E2E8F0] p-3 cursor-grab active:cursor-grabbing hover:border-[#4361EE] hover:shadow-md transition-all",
                        dragging === school.id && "opacity-50 scale-95"
                      )}
                    >
                      {/* School icon + name */}
                      <div className="flex items-start gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF1FD] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-[#3451D1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A] leading-snug">{school.name}</p>
                          <p className="text-xs text-[#64748B]">{school.country}</p>
                        </div>
                        <button className="text-[#64748B] hover:text-[#0F172A] transition-colors flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Type pill */}
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeColor[school.type])}>
                          {typeLabel[school.type]}
                        </span>
                        {school.deadline && (
                          <div className="flex items-center gap-1 text-xs text-[#64748B]">
                            <Calendar className="w-3 h-3" />
                            <span>{school.deadline.slice(5)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add button */}
                <button className="flex items-center gap-2 mx-3 mb-3 px-3 py-2 rounded-lg border border-dashed border-[#E2E8F0] text-xs text-[#64748B] hover:border-[#4361EE] hover:text-[#3451D1] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Шинэ нэмэх
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-[#64748B] mt-2">Картыг чирж хөдөлгөж статусыг өөрчилнэ үү</p>
      </div>
    </div>
  )
}
