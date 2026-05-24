"use client"

import { useState } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  ChevronLeft, ChevronRight, Calendar, Clock,
  Circle, CheckSquare, Users, Tag
} from "lucide-react"

type ViewMode = "month" | "week" | "day"

const MONTHS = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"]
const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"]

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  essay:     { bg: "bg-[#EEF1FD]",  text: "text-[#3451D1]", dot: "bg-[#4361EE]" },
  cv:        { bg: "bg-[#DFEDE0]",  text: "text-[#4A8C4D]", dot: "bg-[#B8D8BA]" },
  transcript:{ bg: "bg-[#FDF4D9]",  text: "text-[#B8860B]", dot: "bg-[#F5D76E]" },
  recommendation:{ bg: "bg-[#F7DDDD]", text: "text-[#C0504D]", dot: "bg-[#F4C2C2]" },
  "test-prep":{ bg: "bg-[#E2E8F0]", text: "text-[#64748B]", dot: "bg-[#C0B8B0]" },
  interview: { bg: "bg-[#FEF0E6]",  text: "text-[#C47A35]", dot: "bg-[#F5C89A]" },
  other:     { bg: "bg-[#E2E8F0]",  text: "text-[#64748B]", dot: "bg-[#C0B8B0]" },
}

const categoryLabel: Record<string, string> = {
  essay: "Essay", cv: "CV", transcript: "Transcript",
  recommendation: "Recommendation", "test-prep": "Шалгалт",
  interview: "Интервью", other: "Бусад",
}

interface CalEvent {
  id: string
  day: number
  month: number  // 0-indexed
  year: number
  title: string
  student: string
  category: string
  time?: string
  done: boolean
}

const events: CalEvent[] = [
  { id: "e1", day: 1,  month: 4, year: 2026, title: "Transcript deadline", student: "Болормаа Дорж", category: "transcript", time: "23:59", done: false },
  { id: "e2", day: 5,  month: 4, year: 2026, title: "CV шалгах", student: "Тунгалаг Ганбаатар", category: "cv", time: "14:00", done: true },
  { id: "e3", day: 10, month: 4, year: 2026, title: "Financial Aid deadline", student: "Номин Батбаяр", category: "other", time: "23:59", done: false },
  { id: "e4", day: 15, month: 4, year: 2026, title: "Common App Essay", student: "Болормаа Дорж", category: "essay", time: "23:59", done: false },
  { id: "e5", day: 15, month: 4, year: 2026, title: "SAT бэлтгэл", student: "Эрдэнэ Сүхбаатар", category: "test-prep", time: "10:00", done: false },
  { id: "e6", day: 18, month: 4, year: 2026, title: "Interview practice", student: "Болормаа Дорж", category: "interview", time: "16:00", done: false },
  { id: "e7", day: 20, month: 4, year: 2026, title: "Recommendation хүсэх", student: "Болормаа Дорж", category: "recommendation", time: "12:00", done: false },
  { id: "e8", day: 23, month: 4, year: 2026, title: "Personal Statement", student: "Номин Батбаяр", category: "essay", time: "23:59", done: false },
  { id: "e9", day: 23, month: 4, year: 2026, title: "Transcript хянах", student: "Тунгалаг Ганбаатар", category: "transcript", time: "11:00", done: false },
  { id: "e10", day: 28, month: 4, year: 2026, title: "MIT эссэ", student: "Болормаа Дорж", category: "essay", time: "23:59", done: false },
]

const students = ["Бүгд", "Болормаа Дорж", "Номин Батбаяр", "Тунгалаг Ганбаатар", "Эрдэнэ Сүхбаатар"]
const categories = ["Бүгд", ...Object.keys(categoryLabel)]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun, need Mon=0
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function CounselorCalendarPage() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>("month")
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(4) // May 0-indexed
  const [selectedStudent, setSelectedStudent] = useState("Бүгд")
  const [selectedCategory, setSelectedCategory] = useState("Бүгд")
  const [selectedDay, setSelectedDay] = useState<number | null>(23)

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const filteredEvents = events.filter(e => {
    const matchStudent = selectedStudent === "Бүгд" || e.student === selectedStudent
    const matchCat = selectedCategory === "Бүгд" || e.category === selectedCategory
    return matchStudent && matchCat
  })

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const eventsForDay = (day: number) =>
    filteredEvents.filter(e => e.day === day && e.month === currentMonth && e.year === currentYear)

  const todayEvents = eventsForDay(selectedDay ?? 23)

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Календар" breadcrumb={["Counselor"]} />

      <div className="flex-1 p-6 flex gap-5 min-h-0">
        {/* Left sidebar: filters */}
        <div className="w-56 flex-shrink-0 space-y-5">
          {/* View toggle */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-1.5 flex flex-col gap-1">
            {(["month", "week", "day"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                  view === v ? "bg-[#4361EE] text-white" : "text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                {v === "month" ? "Сараар" : v === "week" ? "Долоо хоногоор" : "Өдрөөр"}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-3.5 h-3.5 text-[#64748B]" />
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Ангилал</h4>
            </div>
            <div className="space-y-1">
              {categories.map(cat => {
                const color = cat !== "Бүгд" ? CATEGORY_COLORS[cat] : null
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#F8FAFC] font-semibold text-[#0F172A]"
                        : "text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      color ? color.dot : "bg-[#E2E8F0]"
                    }`} />
                    <span className="truncate">{cat === "Бүгд" ? "Бүгд" : categoryLabel[cat]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Student filter */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-[#64748B]" />
              <h4 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">Сурагч</h4>
            </div>
            <div className="space-y-1">
              {students.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left ${
                    selectedStudent === s
                      ? "bg-[#F8FAFC] font-semibold text-[#0F172A]"
                      : "text-[#64748B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-bold">{s.charAt(0)}</span>
                  </div>
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main calendar */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Calendar header */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[#64748B]" />
                </button>
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#64748B]">{filteredEvents.filter(e => e.month === currentMonth && e.year === currentYear).length} үйл явдал</span>
                <button
                  onClick={() => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()) }}
                  className="text-sm font-medium text-[#3451D1] hover:underline px-3 py-1.5 rounded-lg hover:bg-[#EEF1FD] transition-colors"
                >
                  Өнөөдөр
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[#E2E8F0]">
              {WEEKDAYS.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wide">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b border-[#E2E8F0] min-h-[90px] bg-[#F8FAFC]" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayEvents = eventsForDay(day)
                const isSelected = selectedDay === day
                const isTodayDay = isToday(day)
                const colIndex = (firstDay + i) % 7
                const isLastCol = colIndex === 6

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`border-b border-[#E2E8F0] ${!isLastCol ? "border-r" : ""} min-h-[90px] p-2 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#F0F3FF]" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 ${
                      isTodayDay
                        ? "bg-[#4361EE] text-white"
                        : isSelected
                        ? "bg-[#EEF1FD] text-[#3451D1]"
                        : "text-[#0F172A]"
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => {
                        const c = CATEGORY_COLORS[ev.category]
                        return (
                          <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${c.bg} ${c.text}`}>
                            {ev.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-[#64748B] px-1">+{dayEvents.length - 2}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right panel: today's tasks */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow sticky top-6">
            <div className="p-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3451D1]" />
                <h3 className="font-semibold text-[#0F172A] text-sm">
                  {selectedDay ? `${MONTHS[currentMonth]} ${selectedDay}` : "Өдрийн үйл явдал"}
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{todayEvents.length} үйл явдал</p>
            </div>

            <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
              {todayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Circle className="w-8 h-8 text-[#E2E8F0] mb-2" />
                  <p className="text-sm text-[#64748B]">Үйл явдал байхгүй</p>
                </div>
              ) : (
                todayEvents.map(ev => {
                  const c = CATEGORY_COLORS[ev.category]
                  return (
                    <div key={ev.id} className={`rounded-xl p-3 border border-[#E2E8F0] ${ev.done ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${c.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-[#0F172A] leading-tight ${ev.done ? "line-through" : ""}`}>
                            {ev.title}
                          </p>
                          <p className="text-[10px] text-[#64748B] mt-0.5 truncate">{ev.student}</p>
                          {ev.time && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-2.5 h-2.5 text-[#64748B]" />
                              <span className="text-[10px] text-[#64748B]">{ev.time}</span>
                            </div>
                          )}
                          <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                            {categoryLabel[ev.category]}
                          </span>
                        </div>
                        {ev.done && <CheckSquare className="w-3.5 h-3.5 text-[#4A8C4D] flex-shrink-0" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
