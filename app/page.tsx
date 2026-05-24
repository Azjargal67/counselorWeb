"use client"

import Link from "next/link"
import {
  GraduationCap, ArrowRight, BookOpen, Users, Star,
  CheckCircle2, Building2, FileText, TrendingUp, Mail,
} from "lucide-react"

const features = [
  { icon: BookOpen,   title: "Элсэлтийн хяналт",     desc: "Сурагч бүрийн элсэлтийн явцыг нэг дороос хянах" },
  { icon: Users,      title: "Зөвлөх-Сурагч холбоо",  desc: "Мэргэжлийн зөвлөхтэй шууд харилцаж хувийн дэмжлэг авах" },
  { icon: FileText,   title: "Баримт бичиг",          desc: "Материал, захидал, даалгавар бүгдийг нэг газраас удирдах" },
  { icon: TrendingUp, title: "Тайлан шинжилгээ",      desc: "Сургуулийн статистик, амжилтын дүн шинжилгээ" },
  { icon: Star,       title: "Зөвлөмжийн захидал",    desc: "Багшийн зөвлөмжийн захидлыг системтэйгээр удирдах" },
  { icon: Building2,  title: "Олон сургуульд",         desc: "SaaS загвараар олон сургуулийн мэдээллийг тусдаа хадгалах" },
]

const plans = [
  {
    key: "Basic", price: 290, students: 100,
    features: ["100 сурагч", "Элсэлтийн хяналт", "Даалгавар удирдлага", "Баримт бичиг"],
    badge: "bg-[#EEF1FD] text-[#3451D1]",
    ring: "border-[#E2E8F0]",
    cta: "border border-[#4361EE] text-[#3451D1] hover:bg-[#EEF1FD]",
  },
  {
    key: "Pro", price: 490, students: 300,
    features: ["300 сурагч", "Basic-ийн бүх боломж", "Зөвлөхийн тайлан", "Захидлын хяналт"],
    badge: "bg-[#FEF3C7] text-[#D97706]",
    ring: "border-[#4361EE] shadow-lg",
    cta: "bg-[#4361EE] text-white hover:bg-[#3451D1]",
    popular: true,
  },
  {
    key: "Enterprise", price: 890, students: null,
    features: ["Хязгааргүй сурагч", "Pro-ийн бүх боломж", "Тусгай тохиргоо", "Дэмжлэг үзүүлэх"],
    badge: "bg-[#F3F4F6] text-[#0F172A]",
    ring: "border-[#E2E8F0]",
    cta: "border border-[#0F172A] text-[#0F172A] hover:bg-[#F5F3F0]",
  },
]

const howItWorks = [
  { step: "01", title: "Гэрээ байгуулна",      desc: "Сургууль EduCounsel-тэй гэрээ байгуулж тарифаа сонгоно" },
  { step: "02", title: "Бүртгэл үүснэ",         desc: "Платформын администратор сургуулийн бүртгэл болон admin account үүсгэнэ" },
  { step: "03", title: "Хэрэглэгч нэмнэ",       desc: "Сургуулийн admin нь зөвлөх, багш, сурагчдын бүртгэл үүсгэнэ" },
  { step: "04", title: "Ажил эхэлнэ",           desc: "Сурагчид өгсөн credentials-ээрээ нэвтэрч зөвлөгөө авна" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#4361EE] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0F172A]">EduCounsel</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="mailto:info@educounsel.mn"
            className="px-4 py-2 rounded-lg text-[#3451D1] text-sm font-medium hover:bg-[#EEF1FD] transition-colors">
            Холбоо барих
          </a>
          <Link href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4361EE] text-white text-sm font-semibold hover:bg-[#3451D1] transition-colors">
            Нэвтрэх
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF1FD] mb-6">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#3451D1]" />
          <span className="text-xs font-medium text-[#3451D1]">Монгол их сургуулийн элсэлтийн платформ</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 max-w-2xl leading-tight">
          Мөрөөдлийн сургуульдаа{" "}
          <span className="text-[#3451D1]">хамт очъё</span>
        </h1>
        <p className="text-[#64748B] text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          Гадаадад суралцах мөрөөдлийг биелүүлэхэд туслах ухаалаг зөвлөгөөний платформ.
          Зөвлөх, багш, эцэг эх бүгд нэг дор.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a href="mailto:info@educounsel.mn"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#4361EE] text-white font-semibold text-base hover:bg-[#3451D1] transition-colors shadow-sm">
            <Mail className="w-4 h-4" /> Demo хүсэх
          </a>
          <Link href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] font-semibold text-base hover:bg-[#F0EDE8] transition-colors">
            Нэвтрэх <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-10 mt-14">
          {[
            { value: "500+", label: "Сурагчид" },
            { value: "50+",  label: "Сургуулиуд" },
            { value: "95%",  label: "Амжилтын түвшин" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#0F172A]">{s.value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">Яаж ажилладаг вэ?</h2>
        <p className="text-sm text-[#64748B] text-center mb-10">Сургуультай гэрээ байгуулснаар бүх зүйл эхэлнэ</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {howItWorks.map((h, i) => (
            <div key={h.step} className="relative bg-white rounded-2xl border border-[#E2E8F0] p-5">
              {i < howItWorks.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8D2E8] z-10" />
              )}
              <span className="text-3xl font-black text-[#EEF1FD] mb-3 block">{h.step}</span>
              <h3 className="font-semibold text-[#0F172A] mb-1.5 text-sm">{h.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">Боломжууд</h2>
        <p className="text-sm text-[#64748B] text-center mb-10">Сургуулийн зөвлөгөөний үйл явцыг бүрэн автоматжуулна</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="w-10 h-10 rounded-xl bg-[#EEF1FD] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#3451D1]" />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-2">Үнийн санал</h2>
        <p className="text-sm text-[#64748B] text-center mb-10">Сургуулийн хэмжээнд тохирсон тарифыг сонгоно уу</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.key} className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${p.ring}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#4361EE] text-white px-3 py-1 rounded-full">
                  Түгээмэл
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.badge}`}>{p.key}</span>
                <div className="flex items-center gap-1 text-[#64748B]">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs">{p.students ?? "∞"} сурагч</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0F172A] mb-0.5">₮{p.price}K</p>
              <p className="text-xs text-[#64748B] mb-5">/сард нэг сургуульд</p>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#0F172A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3451D1] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:info@educounsel.mn"
                className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.cta}`}>
                Demo хүсэх
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#64748B] mt-6">
          Сургуультай гэрээ байгуулснаар admin account үүсгэж өгнө.{" "}
          <a href="mailto:info@educounsel.mn" className="text-[#3451D1] hover:underline">info@educounsel.mn</a>
        </p>
      </section>

      <footer className="text-center text-xs text-[#64748B] pb-8">
        © 2026 EduCounsel. Бүх эрх хуулиар хамгаалагдсан.
      </footer>
    </div>
  )
}
