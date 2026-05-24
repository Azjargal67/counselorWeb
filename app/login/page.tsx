"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, BookOpen } from "lucide-react"

const ROLE_HOME: Record<string, string> = {
  student:       "/student/home",
  counselor:     "/counselor/home",
  teacher:       "/teacher/home",
  admin:         "/admin/dashboard",
  "super-admin": "/super-admin/overview",
}

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Нэвтрэх үед алдаа гарлаа")
        setLoading(false)
        return
      }
      if (data.user.role === "super-admin") {
        setError("Системийн администратор тусдаа хуудсаар нэвтэрнэ.")
        await fetch("/api/auth/logout", { method: "POST" })
        setLoading(false)
        return
      }
      router.push(ROLE_HOME[data.user.role] ?? "/")
    } catch {
      setError("Серверт холбогдох үед алдаа гарлаа")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center p-12 bg-[#EEF1FD] overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-[#4361EE]/20" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[#4361EE]/15" />
        <div className="absolute top-1/2 right-[-40px] w-32 h-32 rounded-full bg-[#F4C2C2]/30" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-[#4361EE] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">EduCounsel</span>
          </div>

          <div className="relative mx-auto w-64 h-64 mb-10">
            <div className="absolute inset-0 rounded-3xl bg-white/60 shadow-xl" />
            <div className="absolute inset-4 rounded-2xl bg-[#4361EE]/20 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-20 h-20 text-[#3451D1] mx-auto mb-4" />
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-[#4361EE]" style={{ opacity: 0.4 + i * 0.15 }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2 shadow-md border border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#0F172A]">Harvard</p>
              <p className="text-xs text-[#4A8C4D]">Тэнцсэн</p>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-3 py-2 shadow-md border border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#0F172A]">GPA 3.9</p>
              <p className="text-xs text-[#3451D1]">Шилдэг 5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#4361EE] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A]">EduCounsel</span>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] card-shadow">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Тавтай морил</h2>
            <p className="text-[#64748B] text-sm mb-6">И-мэйл болон нууц үгээрээ нэвтэрнэ үү</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">И-мэйл</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError("") }}
                  placeholder="name@educounsel.mn"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4361EE] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Нууц үг</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4361EE] focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#E2E8F0] accent-[#4361EE]"
                  />
                  <span className="text-xs text-[#64748B]">Намайг санах</span>
                </label>
                <Link href="/forgot-password" className="text-xs text-[#3451D1] hover:underline font-medium">
                  Нууц үг мартсан?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#4361EE] text-white font-semibold text-sm hover:bg-[#3451D1] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : "Нэвтрэх"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-[#64748B]">эсвэл</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                  <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
                  <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
                  <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
                </svg>
                Google-ээр нэвтрэх
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-[#64748B] mt-6">© 2026 EduCounsel.</p>
        </div>
      </div>
    </div>
  )
}
