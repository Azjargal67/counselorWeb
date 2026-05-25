"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import { StatusBadge } from "@/components/status-badge"
import { CareerTestModal } from "@/components/career-test-modal"
import {
  Search, SlidersHorizontal, Star, Calendar, ChevronRight,
  X, Upload, MessageSquare, Paperclip, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

type FilterStatus = "all" | "in-progress" | "done" | "overdue" | "todo"

const tabs: { id: FilterStatus; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "in-progress", label: "Хийгдэж буй" },
  { id: "done", label: "Дууссан" },
  { id: "overdue", label: "Хэтэрсэн" },
  { id: "todo", label: "Хийгдээгүй" },
]

const categoryLabel: Record<string, string> = {
  essay: "Essay", cv: "CV", transcript: "Transcript",
  recommendation: "Recommendation", "test-prep": "Шалгалт бэлтгэл",
  interview: "Интервью", "career-test": "Мэргэжил сонголтын тест", other: "Бусад",
}

const categoryColor: Record<string, string> = {
  essay: "bg-[#EEF1FD] text-[#3451D1]",
  cv: "bg-[#DFEDE0] text-[#4A8C4D]",
  transcript: "bg-[#FDF4D9] text-[#B8860B]",
  recommendation: "bg-[#F7DDDD] text-[#C0504D]",
  "test-prep": "bg-[#EEF1FD] text-[#3451D1]",
  interview: "bg-[#FDF4D9] text-[#B8860B]",
  "career-test": "bg-[#F5F3FF] text-[#7C3AED]",
  other: "bg-[#E2E8F0] text-[#64748B]",
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          onClick={() => onChange?.(i)}
          className={cn("w-4 h-4 transition-colors", onChange ? "cursor-pointer hover:text-[#F5D76E]" : "", i <= value ? "fill-[#F5D76E] text-[#F5D76E]" : "text-[#E2E8F0]")}
        />
      ))}
    </div>
  )
}

interface Task {
  id: string; title: string; description: string; category: string
  status: "todo" | "in-progress" | "done" | "overdue"
  deadline: string; priority: "low" | "medium" | "high"
  progress: number; studentId: string; counselorId: string; notes?: string; createdAt: string
}

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<FilterStatus>("all")
  const [search, setSearch] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState("")
  const [taskStatus, setTaskStatus] = useState<Task["status"]>("todo")
  const [showCareerTest, setShowCareerTest] = useState(false)
  const [careerTestViewResults, setCareerTestViewResults] = useState(false)

  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.json())
      .then(d => setTasks(d.tasks ?? []))
      .catch(console.error)
  }, [])

  const counts: Record<FilterStatus, number> = {
    all: tasks.length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => t.status === "overdue").length,
    todo: tasks.filter(t => t.status === "todo").length,
  }

  const filtered = tasks.filter(task => {
    const matchStatus = activeTab === "all" || task.status === activeTab
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Миний даалгавар" breadcrumb={["Сурагч", "Даалгавар"]} />

      <div className="flex-1 p-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                activeTab === tab.id
                  ? "bg-[#4361EE] border-[#4361EE] text-white"
                  : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]"
              )}
            >
              {tab.label}
              <span className={cn("text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-semibold",
                activeTab === tab.id ? "bg-white/30 text-white" : "bg-[#E2E8F0] text-[#64748B]"
              )}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#64748B] hover:border-[#4361EE] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Шүүлт
          </button>
        </div>

        {/* Task grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => {
            // Special card for career-test tasks (detect by category OR title)
            if (task.category === "career-test" || task.title === "Мэргэжил сонголтын тест") {
              const done = task.status === "done"
              return (
                <div key={task.id}
                  className={cn(
                    "rounded-xl border-2 p-4 card-shadow transition-all",
                    done
                      ? "bg-[#F5F3FF] border-[#C4B5FD]"
                      : "bg-gradient-to-br from-[#F5F3FF] to-[#EEF1FD] border-[#7C3AED] hover:shadow-md"
                  )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <h3 className="font-semibold text-[#0F172A] text-sm mb-1 leading-snug">{task.title}</h3>
                  <p className="text-xs text-[#64748B] mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{task.deadline?.split("T")[0]}</span>
                  </div>
                  {done ? (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { setCareerTestViewResults(true); setShowCareerTest(true) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold rounded-lg hover:bg-[#DDD6FE] transition-colors">
                        Хариу харах
                      </button>
                      <button
                        onClick={() => { setCareerTestViewResults(false); setShowCareerTest(true) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#C4B5FD] text-[#7C3AED] text-xs font-semibold rounded-lg hover:bg-[#F5F3FF] transition-colors">
                        Дахин өгөх
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setCareerTestViewResults(false); setShowCareerTest(true) }}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-[#7C3AED] text-white text-xs font-semibold rounded-lg hover:bg-[#6D28D9] transition-colors">
                      Тест өгөх <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            }

            return (
              <div
                key={task.id}
                onClick={() => { setSelectedTask(task); setNotes(task.notes ?? ""); setTaskStatus(task.status); setTaskProgress({ ...taskProgress, [task.id]: task.progress }) }}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-[#4361EE] hover:shadow-md transition-all cursor-pointer card-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", categoryColor[task.category])}>
                    {categoryLabel[task.category]}
                  </span>
                  <StatusBadge status={task.status} />
                </div>

                <h3 className="font-semibold text-[#0F172A] text-sm mb-1.5 leading-snug">{task.title}</h3>
                <p className="text-xs text-[#64748B] mb-3 line-clamp-2 leading-relaxed">{task.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={task.status === "overdue" ? "text-[#C0504D] font-medium" : ""}>{task.deadline?.split("T")[0]}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </div>

                <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                  <StarRating value={taskProgress[task.id] ?? task.progress} />
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-3 py-16 text-center">
              <Search className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-[#64748B] text-sm">Даалгавар олдсонгүй</p>
            </div>
          )}
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedTask(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#E2E8F0] sticky top-0 bg-white rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", categoryColor[selectedTask.category])}>
                    {categoryLabel[selectedTask.category]}
                  </span>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <h2 className="font-bold text-[#0F172A] text-lg leading-snug">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Тайлбар</h4>
                <p className="text-sm text-[#0F172A] leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg p-3">
                <Calendar className="w-4 h-4 text-[#3451D1]" />
                <div>
                  <p className="text-xs text-[#64748B]">Deadline</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{selectedTask.deadline}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Төлөв өөрчлөх</h4>
                <div className="flex gap-2">
                  {(["todo", "in-progress", "done"] as Task["status"][]).map(s => {
                    const labels: Record<string, string> = { todo: "Хийгдээгүй", "in-progress": "Хийж байна", done: "Дууссан" }
                    const colors: Record<string, string> = {
                      todo: "border-[#E2E8F0] text-[#64748B]",
                      "in-progress": "border-[#4361EE] text-[#4361EE]",
                      done: "border-[#4A8C4D] text-[#4A8C4D]",
                    }
                    const activeColors: Record<string, string> = {
                      todo: "bg-[#E2E8F0] text-[#0F172A] border-[#E2E8F0]",
                      "in-progress": "bg-[#EEF1FD] text-[#4361EE] border-[#4361EE]",
                      done: "bg-[#DFEDE0] text-[#4A8C4D] border-[#4A8C4D]",
                    }
                    return (
                      <button key={s} onClick={() => setTaskStatus(s)}
                        className={cn("flex-1 py-2 rounded-lg border text-xs font-semibold transition-all",
                          taskStatus === s ? activeColors[s] : colors[s] + " hover:bg-[#F8FAFC]")}>
                        {labels[s]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Counselor notes */}
              {selectedTask.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Зөвлөхийн тэмдэглэл
                  </h4>
                  <div className="bg-[#EEF1FD] rounded-lg p-3 text-sm text-[#0F172A]">{selectedTask.notes}</div>
                </div>
              )}

              {/* Progress */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Ахиц (1-5 одоор)</h4>
                <StarRating value={taskProgress[selectedTask.id] ?? selectedTask.progress} onChange={v => setTaskProgress(p => ({ ...p, [selectedTask.id]: v }))} />
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">Тэмдэглэл</h4>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Тэмдэглэл бичих..."
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all resize-none"
                />
              </div>

              {/* File upload */}
              <div>
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> Файл хавсаргах
                </h4>
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-4 text-center hover:border-[#4361EE] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#64748B] mx-auto mb-1.5" />
                  <p className="text-xs text-[#64748B]">Файл чирж оруулах эсвэл <span className="text-[#3451D1] font-medium">сонгох</span></p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-[#E2E8F0] sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setSelectedTask(null)} className="flex-1 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                Болих
              </button>
              <button
                onClick={() => {
                  if (!selectedTask) return
                  const progress = (taskProgress[selectedTask.id] ?? Math.ceil(selectedTask.progress / 20)) * 20
                  fetch(`/api/tasks/${selectedTask.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ progress, notes, status: taskStatus }),
                  }).then(r => r.json()).then(d => {
                    if (d.task) setTasks(prev => prev.map(t => t.id === d.task.id ? d.task : t))
                    setSelectedTask(null)
                  }).catch(console.error)
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#4361EE] text-white font-semibold text-sm hover:bg-[#3451D1] transition-colors"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}

      <CareerTestModal
        isOpen={showCareerTest}
        viewResults={careerTestViewResults}
        onClose={() => setShowCareerTest(false)}
        onComplete={() => {
          setTasks(prev => prev.map(t =>
            (t.category === "career-test" || t.title === "Мэргэжил сонголтын тест")
              ? { ...t, status: "done" as const, progress: 100 }
              : t
          ))
          setShowCareerTest(false)
        }}
      />
    </div>
  )
}
