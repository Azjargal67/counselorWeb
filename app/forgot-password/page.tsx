"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#EEF1FD] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-[#4361EE]/20" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#4361EE]/15" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#4361EE] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">EduCounsel</span>
          </div>
          <div className="w-40 h-40 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Mail className="w-20 h-20 text-[#4361EE]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Нууц үг сэргээх</h2>
          <p className="text-[#64748B] text-sm leading-relaxed max-w-xs mx-auto">
            Бүртгэлтэй и-мэйл рүүгээ сэргээх холбоос явуулна
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] card-shadow">
            {!sent ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-[#EEF1FD] flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-[#3451D1]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Нууц үг мартсан?</h2>
                <p className="text-[#64748B] text-sm mb-6">
                  И-мэйл хаягаа оруулна уу. Сэргээх холбоос явуулна.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">И-мэйл хаяг</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.mn"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-[#4361EE] text-white font-semibold text-sm hover:bg-[#3451D1] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Явуулж байна...</>
                    ) : "Сэргээх холбоос явуулах"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#DFEDE0] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-[#4A8C4D]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">И-мэйл явуулсан!</h3>
                <p className="text-[#64748B] text-sm mb-6">
                  <span className="font-medium text-[#0F172A]">{email}</span> хаяг руу сэргээх холбоос явуулсан. И-мэйлээ шалгана уу.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-[#3451D1] hover:underline"
                >
                  Өөр и-мэйл оруулах
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <Link href="/login" className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#3451D1] transition-colors justify-center">
              <ArrowLeft className="w-3.5 h-3.5" />
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
