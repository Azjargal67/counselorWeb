"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldCheck, AlertTriangle, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    router.push("/super-admin/overview")
  }

  return (
    <div className="min-h-screen bg-[#1A1F2E] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#A8B5E0 1px, transparent 1px), linear-gradient(90deg, #A8B5E0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-[#1A1F2E] px-8 pt-8 pb-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#818CF8]" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Super Admin Access</h1>
            <p className="text-[#94A3B8] text-sm">EduCounsel систем</p>
          </div>

          <div className="px-8 py-6">
            {/* Warning banner */}
            <div className="flex items-start gap-3 bg-[#FDF4D9] border border-[#F5D76E]/50 rounded-lg p-3 mb-6">
              <AlertTriangle className="w-4 h-4 text-[#B8860B] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#B8860B] font-medium">
                Зөвхөн эрх бүхий хүмүүст. Зөвшөөрөлгүй нэвтрэхийг оролдох хуулиар хориглоно.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D3A3A] mb-1.5">И-мэйл</label>
                <input
                  type="email"
                  defaultValue="admin@educounsel.mn"
                  placeholder="admin@educounsel.mn"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#EAE6E0] bg-[#FAF8F5] text-sm text-[#3D3A3A] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D3A3A] mb-1.5">Нууц үг</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#EAE6E0] bg-[#FAF8F5] text-sm text-[#3D3A3A] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8680]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div>
                <label className="block text-xs font-semibold text-[#3D3A3A] mb-1.5">2FA Код (6 оронтой)</label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      className="w-10 h-11 text-center rounded-lg border border-[#EAE6E0] bg-[#FAF8F5] text-sm font-bold text-[#3D3A3A] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#1A1F2E] text-white font-semibold text-sm hover:bg-[#2C3655] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Нэвтэрч байна...</>
                ) : "Нэвтрэх"}
              </button>
            </form>
          </div>

          {/* Back link */}
          <div className="px-8 pb-6 -mt-2">
            <Link href="/login" className="flex items-center gap-1.5 text-xs text-[#8B8680] hover:text-[#6B7FB8] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Энгийн login руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
