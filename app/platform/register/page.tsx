"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Shield, CheckCircle2, Users, Building2, Eye, EyeOff, ChevronRight, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    key: "Basic",
    price: 290000,
    students: 100,
    features: ["100 сурагч", "Элсэлтийн хяналт", "Даалгавар удирдлага", "Баримт бичиг"],
    color: "border-[#3C4875] hover:border-[#94A3B8]",
    badge: "bg-[#94A3B8]/20 text-[#94A3B8]",
  },
  {
    key: "Pro",
    price: 490000,
    students: 300,
    features: ["300 сурагч", "Basic-ийн бүх боломж", "Зөвлөхийн тайлан", "Захидлын хяналт"],
    color: "border-[#E8960A]/40 hover:border-[#F8CF6A]",
    badge: "bg-[#E8960A]/20 text-[#F8CF6A]",
    popular: true,
  },
  {
    key: "Enterprise",
    price: 890000,
    students: null,
    features: ["Хязгааргүй сурагч", "Pro-ийн бүх боломж", "Тусгай тохиргоо", "Дэмжлэг үзүүлэх"],
    color: "border-[#6366F1]/40 hover:border-[#6366F1]",
    badge: "bg-[#6366F1]/20 text-[#818CF8]",
  },
]

const STEPS = ["Тариф сонгох", "Мэдээлэл оруулах", "Төлбөр төлөх"]

export default function PlatformRegisterPage() {
  const router = useRouter()
  const [step, setStep]           = useState(0)
  const [plan, setPlan]           = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [adminName, setAdminName]   = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPass, setAdminPass]   = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")
  const [tenantId, setTenantId]     = useState("")
  const [confirmed, setConfirmed]   = useState(false)

  const selectedPlan = PLANS.find(p => p.key === plan)

  const handleRegister = async () => {
    if (!schoolName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPass.trim()) {
      setError("Бүх талбарыг бөглөнө үү"); return
    }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/platform/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName, plan, adminName, adminEmail, adminPassword: adminPass }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Алдаа гарлаа"); return }
      setTenantId(data.tenantId)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/platform/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })
      if (!res.ok) { setError("Баталгаажуулахад алдаа гарлаа"); return }
      setConfirmed(true)
      setTimeout(() => router.push("/login"), 2500)
    } finally {
      setLoading(false)
    }
  }

  const qpayUrl = `https://qpay.mn/payment/${tenantId || "demo"}`

  return (
    <div className="min-h-screen bg-[#0F1629] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-[#818CF8]" />
          </div>
          <h1 className="text-xl font-bold text-white">EduCounsel-д бүртгүүлэх</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Сургуулийн бүртгэл</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
                i === step ? "bg-[#6366F1] text-white" : i < step ? "bg-[#4A8C4D]/30 text-[#6CC970]" : "bg-[#2C3655] text-[#94A3B8]"
              )}>
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#3C4875]" />}
            </div>
          ))}
        </div>

        {/* Step 0: Plan selection */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPlan(p.key)}
                  className={cn(
                    "relative text-left bg-[#1E2540] rounded-2xl border-2 p-5 transition-all",
                    p.color,
                    plan === p.key && "ring-2 ring-[#6366F1] ring-offset-2 ring-offset-[#0F1629]"
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#F8CF6A] text-[#0F1629] px-2.5 py-0.5 rounded-full">
                      Түгээмэл
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", p.badge)}>{p.key}</span>
                    {plan === p.key && <CheckCircle2 className="w-4 h-4 text-[#818CF8]" />}
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    ₮{(p.price / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-[#94A3B8] mb-4">/сард</p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span className="text-xs text-[#CBD5E1] font-semibold">
                      {p.students ? `${p.students} сурагч` : "Хязгааргүй"}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                        <CheckCircle2 className="w-3 h-3 text-[#6CC970] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <button
              onClick={() => plan && setStep(1)}
              disabled={!plan}
              className="w-full bg-[#6366F1] hover:bg-[#8FA3D8] disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              Үргэлжлүүлэх →
            </button>
          </div>
        )}

        {/* Step 1: School info */}
        {step === 1 && (
          <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-[#94A3B8]" />
              <p className="text-xs text-[#94A3B8]">Сургуулийн болон администраторын мэдээлэл</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Сургуулийн нэр *</label>
              <input
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="Жишээ: Монгол Улсын Их Сургууль"
                className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Администраторын нэр *</label>
              <input
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="Таны нэр"
                className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">И-мэйл *</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@school.edu.mn"
                className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Нууц үг *</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-[#F08080] bg-[#C0504D]/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 border border-[#2C3655] text-[#94A3B8] hover:bg-[#2C3655] py-2.5 rounded-xl text-sm transition-colors">
                Буцах
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 bg-[#6366F1] hover:bg-[#8FA3D8] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? "Үүсгэж байна..." : "Төлбөр рүү →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: QPay */}
        {step === 2 && (
          <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-6">
            {confirmed ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#4A8C4D]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#6CC970]" />
                </div>
                <p className="text-white font-bold text-lg">Төлбөр баталгаажлаа!</p>
                <p className="text-sm text-[#94A3B8]">Нэвтрэх хуудас руу шилжиж байна...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white font-semibold">{selectedPlan?.key} тариф</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{schoolName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">₮{((selectedPlan?.price ?? 0) / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-[#94A3B8]">/сард</p>
                  </div>
                </div>

                {/* QPay UI */}
                <div className="bg-[#0F1629] rounded-2xl p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                        <span className="text-white text-[10px] font-black">Q</span>
                      </div>
                      <span className="text-white font-bold text-sm">QPay</span>
                    </div>
                    <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" /> Апп-аар уншина уу
                    </span>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-3 rounded-2xl">
                      <QRCodeSVG value={qpayUrl} size={160} />
                    </div>
                  </div>
                  <p className="text-center text-xs text-[#94A3B8]">
                    QPay апп нээж QR код уншуулна уу
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="flex-1 h-px bg-[#2C3655]" />
                    <span className="text-xs text-[#475569]">эсвэл</span>
                    <div className="flex-1 h-px bg-[#2C3655]" />
                  </div>
                  <p className="text-center text-xs text-[#94A3B8] mt-3">
                    Данс: <span className="text-white font-mono">5000 1234 5678</span>
                  </p>
                  <p className="text-center text-xs text-[#94A3B8]">
                    Гүйлгээний утга: <span className="text-white font-mono">{tenantId.slice(-8).toUpperCase()}</span>
                  </p>
                </div>

                {error && <p className="text-xs text-[#F08080] bg-[#C0504D]/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full bg-[#4A8C4D] hover:bg-[#3d7a40] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? "Шалгаж байна..." : "Төлбөр баталгаажуулах"}
                </button>
                <p className="text-center text-xs text-[#475569] mt-3">
                  Төлбөр хийсний дараа товчийг дарна уу
                </p>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-[#475569] mt-6">
          Бүртгэлтэй байгаа бол{" "}
          <a href="/login" className="text-[#94A3B8] hover:text-[#818CF8] transition-colors">энд дарна уу</a>
        </p>
      </div>
    </div>
  )
}
