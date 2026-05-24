"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppTopbar } from "@/components/app-topbar"
import {
  Mail, FileText, Clock, CheckCircle2, ChevronRight,
  AlertCircle, User, Calendar, Star,
  TrendingUp, Building2, PenLine, Send,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface RecommendationRequest {
  id: string; studentId: string; studentName: string
  teacherId: string; teacherName: string; school: string
  deadline: string; status: "pending" | "writing" | "sent" | "rejected"
  message: string; createdAt: string
}

const statusConfig = {
  pending:  { label: "Хүлээгдэж буй", color: "bg-amber-50 text-amber-700 border-amber-200" },
  writing:  { label: "Бичиж байна",   color: "bg-blue-50 text-blue-700 border-blue-200"   },
  sent:     { label: "Илгээсэн",       color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Татгалзсан",    color: "bg-red-50 text-red-700 border-red-200"       },
}

export default function TeacherHomePage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RecommendationRequest[]>([])

  useEffect(() => {
    fetch("/api/recommendations")
      .then(r => r.json())
      .then(d => setRequests(d.requests ?? []))
      .catch(console.error)
  }, [])

  const pending = useMemo(() => requests.filter(r => r.status === "pending"), [requests])
  const writing = useMemo(() => requests.filter(r => r.status === "writing"), [requests])
  const sent    = useMemo(() => requests.filter(r => r.status === "sent"), [requests])
  const recent  = useMemo(() => requests.slice(0, 5), [requests])

  const deadlineDays = (dl: string) =>
    Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000)

  const stats = [
    { label: "Шинэ хүсэлт",   value: pending.length,  icon: Mail,    color: "bg-[#FFF3E0] text-[#E8960A]" },
    { label: "Бичиж байна",   value: writing.length,  icon: PenLine, color: "bg-[#EEF1FD] text-[#3451D1]" },
    { label: "Илгээсэн нийт", value: sent.length,     icon: Send,    color: "bg-[#DFEDE0] text-[#4A8C4D]" },
    { label: "Нийт хүсэлт",   value: requests.length, icon: Clock,   color: "bg-[#FCE8E8] text-[#C0504D]" },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Нүүр хуудас" />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-[#1E2540] text-white p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#4361EE] mb-1">Сайн байна уу,</p>
            <h1 className="text-2xl font-bold mb-1">{user?.name ?? "Багш"}</h1>
            <p className="text-sm text-[#C8D2E8]">
              Танд <span className="text-[#F8CF6A] font-semibold">{pending.length} шинэ хүсэлт</span> ирсэн байна.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-[#8B9CC0] mb-0.5">Нийт хүсэлт</p>
              <p className="text-3xl font-bold text-[#4361EE]">{requests.length}</p>
              <p className="text-xs text-[#8B9CC0]">Нийт</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#4361EE]/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-[#4361EE]" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E2E8F0]">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-[#64748B] font-medium leading-tight">{s.label}</p>
                </div>
                <p className="text-3xl font-bold text-[#0F172A]">{s.value}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending requests */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E8960A]" />
                <h2 className="font-semibold text-sm text-[#0F172A]">Хүлээгдэж буй хүсэлтүүд</h2>
                <span className="bg-[#FFF3E0] text-[#E8960A] text-xs font-bold px-2 py-0.5 rounded-full">{pending.length + writing.length}</span>
              </div>
              <Link href="/teacher/requests" className="text-xs text-[#3451D1] hover:underline flex items-center gap-1">
                Бүгд <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {[...pending, ...writing].map(req => {
                const days = deadlineDays(req.deadline)
                const cfg = statusConfig[req.status]
                return (
                  <div key={req.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#4361EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-semibold">{req.studentName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-sm font-semibold text-[#0F172A]">{req.studentName}</p>
                        <span className={cn("text-xs border px-2 py-0.5 rounded-full font-medium", cfg.color)}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{req.school}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={cn(days <= 7 ? "text-[#C0504D] font-semibold" : "")}>
                            {days > 0 ? `${days} хоног` : "Хугацаа дууссан"}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 truncate max-w-xs">{req.message}</p>
                    </div>
                    <Link
                      href="/teacher/requests"
                      className="flex-shrink-0 text-xs font-medium bg-[#4361EE] hover:bg-[#8FA3D8] text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Бичих
                    </Link>
                  </div>
                )
              })}
              {pending.length === 0 && writing.length === 0 && (
                <div className="py-10 text-center text-[#64748B] text-sm">
                  <CheckCircle2 className="w-8 h-8 text-[#4A8C4D] mx-auto mb-2" />
                  Бүх хүсэлт шийдвэрлэгдсэн
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h2 className="font-semibold text-sm text-[#0F172A] mb-3">Хурдан үйлдэл</h2>
              <div className="space-y-2">
                <Link href="/teacher/requests" className="flex items-center gap-3 p-3 rounded-xl bg-[#EEF1FD] hover:bg-[#D4DCEF] transition-colors">
                  <Mail className="w-4 h-4 text-[#3451D1]" />
                  <span className="text-sm font-medium text-[#3451D1]">Хүсэлтүүд харах</span>
                  {pending.length > 0 && (
                    <span className="ml-auto bg-[#3451D1] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
                  )}
                </Link>
                <Link href="/teacher/letters" className="flex items-center gap-3 p-3 rounded-xl bg-[#DFEDE0] hover:bg-[#C8DFD0] transition-colors">
                  <FileText className="w-4 h-4 text-[#4A8C4D]" />
                  <span className="text-sm font-medium text-[#4A8C4D]">Захидлууд</span>
                </Link>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#64748B]" />
                <h2 className="font-semibold text-sm text-[#0F172A]">Сүүлийн үйл ажиллагаа</h2>
              </div>
              <div className="space-y-3">
                {recent.map(r => {
                  const cfg = statusConfig[r.status]
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#4361EE]/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-[#3451D1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A] truncate">{r.studentName}</p>
                        <p className="text-xs text-[#64748B] truncate">{r.school}</p>
                      </div>
                      <span className={cn("text-xs border px-1.5 py-0.5 rounded-full font-medium flex-shrink-0", cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
                {recent.length === 0 && (
                  <p className="text-xs text-[#64748B] text-center py-2">Үйл ажиллагаа байхгүй</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
