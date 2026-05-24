"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, Lock } from "lucide-react"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
        return
      }
      if (data.user.role !== "super-admin") {
        setError("Энэ хуудас зөвхөн системийн администраторт зориулагдсан.")
        await fetch("/api/auth/logout", { method: "POST" })
        return
      }
      router.push("/super-admin/overview")
    } catch {
      setError("Серверт холбогдох үед алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1629] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-[#818CF8]" />
          </div>
          <h1 className="text-xl font-bold text-white">Системийн удирдлага</h1>
          <p className="text-sm text-[#94A3B8] mt-1">EduCounsel Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E2540] rounded-2xl border border-[#2C3655] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-[#94A3B8]" />
            <p className="text-xs text-[#94A3B8]">Зөвхөн зөвшөөрөлтэй хэрэглэгчид</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">И-мэйл</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@educounsel.mn"
                required
                className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">Нууц үг</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#2C3655] border border-[#3C4875] rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#6366F1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#C0504D]/15 border border-[#C0504D]/30 rounded-xl px-3 py-2.5">
                <p className="text-xs text-[#F08080]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366F1] hover:bg-[#8FA3D8] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#475569] mt-6">
          Ердийн хэрэглэгч бол{" "}
          <a href="/login" className="text-[#94A3B8] hover:text-[#818CF8] transition-colors">
            энд дарна уу
          </a>
        </p>
        <p className="text-center text-xs text-[#475569] mt-2">
          Сургуулиа бүртгүүлэх бол{" "}
          <a href="/platform/register" className="text-[#94A3B8] hover:text-[#818CF8] transition-colors">
            энд дарна уу
          </a>
        </p>
      </div>
    </div>
  )
}
