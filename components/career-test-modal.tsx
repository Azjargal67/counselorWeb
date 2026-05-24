"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type HollandType = "R" | "I" | "A" | "S" | "E" | "C"
const TYPES: HollandType[] = ["R", "I", "A", "S", "E", "C"]

const TYPE_INFO: Record<HollandType, {
  fullLabel: string; color: string; bg: string; border: string; desc: string; careers: string[]
}> = {
  R: { fullLabel: "Практик",    color: "#4A8C4D", bg: "#DFEDE0", border: "#B8D8BA", desc: "Та практик, гарын авцтай, техник ажилд дуртай. Гараар хийх ажил, тоног төхөөрөмж, байгаль дэвсгэртэй ажиллах таалагддаг.", careers: ["Инженер", "Механик", "Нисгэгч", "Барилгачин", "Газар тариаланч", "Тоног төхөөрөмжийн мэргэжилтэн"] },
  I: { fullLabel: "Судлаач",    color: "#3451D1", bg: "#EEF1FD", border: "#B0BEF5", desc: "Та аналитик, сониуч, шинэ мэдлэг олж авахыг эрмэлздэг. Судалгаа, туршилт, онолын ажил таалагддаг.",              careers: ["Эмч", "Математикч", "Программист", "Судлаач", "Химич", "Биологич"] },
  A: { fullLabel: "Бүтээлч",   color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD", desc: "Та бүтээлч, уран зургийн авьяастай, ажлаа гоё болгох дуртай. Урлаг, хөгжим, уран зохиол таалагддаг.",              careers: ["Зураач", "Хөгжимч", "Зохиолч", "Дизайнер", "Найруулагч", "Гэрэл зурагч"] },
  S: { fullLabel: "Нийгмэч",   color: "#B8860B", bg: "#FDF4D9", border: "#EDD99A", desc: "Та хүмүүстэй ажиллах, туслах, зааж сургахдаа дуртай. Нийгмийн харилцаа, эмпати сайтай.",                             careers: ["Багш", "Сэтгэл зүйч", "Нийгмийн ажилтан", "Сувилагч", "Зөвлөх", "Хүний нөөцийн мэргэжилтэн"] },
  E: { fullLabel: "Манлайлагч", color: "#C0504D", bg: "#F7DDDD", border: "#F0B0AE", desc: "Та удирдлага, зохион байгуулалт, итгүүлэхэд авьяастай. Бизнес, улс төр, менежментэд сонирхолтой.",                  careers: ["Бизнесмэн", "Менежер", "Хуульч", "Улс төрч", "Маркетерч", "Борлуулалтын ажилтан"] },
  C: { fullLabel: "Дэгтэй",    color: "#64748B", bg: "#E2E8F0", border: "#CBD5E1", desc: "Та дэг журам, нарийн байдал, дэгтэй ажиллах дуртай. Мэдээлэл цэгцлэх, тооцоо, нягтлан таалагддаг.",                 careers: ["Нягтлан", "Санхүүч", "Банкны ажилтан", "Архивч", "Нарийн бичгийн дарга", "Мэдээллийн системийн ажилтан"] },
}

const TEST1_GROUPS: { type: HollandType; label: string; questions: string[] }[] = [
  { type: "R", label: "Практик (R)", questions: ["Машин, тоног төхөөрөмж засварлах", "Гараар зүйл хийх, угсрах, урлах", "Барилга, дэд бүтэц, инженерчлэлтэй холбоотой зүйл судлах", "Байгалийн дотор, гадаа ажиллах", "Техник ур чадвар шаарддаг спорт, үйл ажиллагаа", "Тариалан, малын аж ахуй, ой тайгатай холбоотой ажил"] },
  { type: "I", label: "Судлаач (I)", questions: ["Шинжлэх ухааны ном, нийтлэл унших", "Туршилт хийх, үр дүнг шинжлэх", "Математик болон логикийн бодлого бодох", "Шинэ нээлт, онол, нотолгоог судлах", "Тоо, статистикийн шинжилгээ хийх", "Компьютерийн программ, алгоритм сурах"] },
  { type: "A", label: "Бүтээлч (A)", questions: ["Зурах, хийцлэх, дизайн хийх", "Хөгжим тоглох, дуулах", "Яруу найраг, өгүүллэг, роман бичих", "Театр, кино жүжиглэх", "Фото, видео буулгах, монтаж хийх", "Бүжиглэх, урлагийн тоглолтод оролцох"] },
  { type: "S", label: "Нийгмэч (S)", questions: ["Найз нөхөд, гэр бүлийнхэнд туслах", "Хүмүүсийн асуудлыг сонсож, зөвлөгөө өгөх", "Хүүхэд, залуучуудад зааж сургах", "Нийгмийн сайн дурын ажилд оролцох", "Багийн гишүүдтэй хамтран ажиллах", "Зовлонтой, хэрэгцээтэй хүнд туслах"] },
  { type: "E", label: "Манлайлагч (E)", questions: ["Бусдыг удирдах, зорилго тавих", "Бизнес, худалдаа эрхлэх", "Бусдыг итгүүлэх, ятгах, нотлох", "Хурал, арга хэмжээ зохион байгуулах", "Шинэ санаа, аж ахуйн төсөл хэрэгжүүлэх", "Улс төр, нийгмийн нөлөө бүхий үйл ажиллагаанд оролцох"] },
  { type: "C", label: "Дэгтэй (C)", questions: ["Баримт бичиг, мэдээлэл цэгцлэх, эмхлэх", "Нягтлан бодох бүртгэл, санхүүгийн тооцоо хийх", "Тодорхой дүрэм, журмыг нарийн дагаж мөрдөх", "Мэдээллийн санд өгөгдөл оруулах, дүн шинжилгээ хийх", "Мэдээлэл, тооцоог компьютерт боловсруулах", "Архив, номын санд ажиллах"] },
]

const TEST2_GROUPS: { type: HollandType; label: string; questions: string[] }[] = [
  { type: "R", label: "Практик (R)", questions: ["Техникийн тоног төхөөрөмж ажиллуулж, засварлаж чадна", "Гараар зүйл хийж, угсарч чадна", "Орон сууц, барилгын засвар хийж чадна", "Автомашин, мотоцикл засварлаж чадна", "Газар тариалан, малын аж ахуй эрхлэж чадна", "Бие бялдрын хүчний ажил сайн хийж чадна"] },
  { type: "I", label: "Судлаач (I)", questions: ["Нарийн математик тооцоо хийж чадна", "Шинжилгээ хийж, дүгнэлт гаргаж чадна", "Судалгааны мэдээлэл цуглуулж, боловсруулж чадна", "Шинжлэх ухааны ойлголтыг хэрэглэж чадна", "Компьютерийн программчлал хийж чадна", "Медицин, биологийн мэдлэгтэй ажиллаж чадна"] },
  { type: "A", label: "Бүтээлч (A)", questions: ["Зурах, хийцлэх ажил хийж чадна", "Хөгжим тоглодог эсвэл дуулдаг", "Уран зохиол, яруу найраг бичиж чадна", "Фото, видео контент бүтээж чадна", "Дизайны материал, урлагийн бүтээл туурвиж чадна", "Театр, үзүүлбэрт жүжиглэж чадна"] },
  { type: "S", label: "Нийгмэч (S)", questions: ["Хүмүүсийг сайн сонсож, ойлгодог", "Хүүхдэд, залуучуудад зааж чадна", "Мэдээллийг ойлгомжтой тайлбарлаж чадна", "Зөрчилдөөн шийдвэрлэж, зуучлаж чадна", "Хамт олны сэтгэлийн уур амьсгалыг мэдэрдэг", "Сэтгэл зүйн дэмжлэг үзүүлж чадна"] },
  { type: "E", label: "Манлайлагч (E)", questions: ["Бусдыг нөлөөлж, удирдаж чадна", "Борлуулалт, маркетинг хийж чадна", "Олон нийтийн өмнө итгэлтэй үг хэлж чадна", "Бизнесийн асуудлыг шийдэж чадна", "Тэргүүлэгчийн үүрэгт ажиллаж чадна", "Шинэ бизнес санаа хэрэгжүүлж чадна"] },
  { type: "C", label: "Дэгтэй (C)", questions: ["Нягтлан бодох бүртгэлийн ажил хийж чадна", "Мэдээлэл, өгөгдлийг эмх цэгцтэй зохион байгуулж чадна", "Баримт бичиг, тайлан боловсруулж чадна", "Дэгтэй, нарийн цэгцтэй ажлын горим сахиж чадна", "Тодорхой хуваарь, дүрэм журмыг нарийн дагаж чадна", "Нарийн тооцоо, шалгалт хийж чадна"] },
]

const CAREER_PAIRS: [string, HollandType, string, HollandType][] = [
  ["Цахилгааны инженер", "R", "Программист", "I"], ["Механик", "R", "Химич", "I"], ["Барилгын инженер", "R", "Математикч", "I"],
  ["Засварчин", "R", "Зураач", "A"], ["Автомашин засварч", "R", "Хөгжимч", "A"], ["Тариаланч", "R", "Зохиолч", "A"],
  ["Барилгачин", "R", "Багш", "S"], ["Механик", "R", "Нийгмийн ажилтан", "S"], ["Тоног тех. мэргэжилтэн", "R", "Сэтгэл зүйч", "S"],
  ["Уул уурхайн инженер", "R", "Аж ахуйн захирал", "E"], ["Газрын зурагч", "R", "Улс төрч", "E"], ["Ойн инженер", "R", "Менежер", "E"],
  ["Гагнуурч", "R", "Нягтлан", "C"], ["Барилгачин", "R", "Архивч", "C"], ["Тариаланч", "R", "Санхүүч", "C"],
  ["Биологич", "I", "Жүжигчин", "A"], ["Химич", "I", "Дизайнер", "A"], ["Математикч", "I", "Гэрэл зурагч", "A"],
  ["Эмч", "I", "Нийгмийн ажилтан", "S"], ["Судлаач", "I", "Зөвлөх", "S"], ["Программист", "I", "Сургалтын менежер", "S"],
  ["Химич", "I", "Бизнесмэн", "E"], ["Биологич", "I", "Улс төрч", "E"], ["Судлаач", "I", "Хуульч", "E"],
  ["Математикч", "I", "Нягтлан", "C"], ["Физикч", "I", "Мэдээллийн оператор", "C"], ["Программист", "I", "Банкны ажилтан", "C"],
  ["Зураач", "A", "Сургалтын зөвлөх", "S"], ["Хөгжимч", "A", "Сувилагч", "S"], ["Зохиолч", "A", "Нийгмийн ажилтан", "S"],
  ["Дизайнер", "A", "Маркетерч", "E"], ["Жүжигчин", "A", "Борлуулалтын менежер", "E"], ["Зохиолч", "A", "Аж ахуйн захирал", "E"],
  ["Зураач", "A", "Архивч", "C"], ["Гэрэл зурагч", "A", "Нягтлан", "C"], ["Хөгжимч", "A", "Санхүүч", "C"],
  ["Нийгмийн ажилтан", "S", "Хуульч", "E"], ["Сэтгэл зүйч", "S", "Борлуулалтын менежер", "E"],
  ["Багш", "S", "Нягтлан", "C"], ["Зөвлөх", "S", "Банкны ажилтан", "C"],
  ["Хуульч", "E", "Санхүүч", "C"], ["Менежер", "E", "Архивч", "C"],
]

const RATINGS = [
  { value: 1, label: "Огт дургүй" }, { value: 2, label: "Дургүй" },
  { value: 3, label: "Дуртай" }, { value: 4, label: "Ихэд дуртай" },
]

function computeScores(a1: number[], a2: number[], a3: number[]): Record<HollandType, number> {
  const s: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  TEST1_GROUPS.forEach((g, gi) => g.questions.forEach((_, qi) => { if (a1[gi * 6 + qi] > 0) s[g.type] += a1[gi * 6 + qi] }))
  TEST2_GROUPS.forEach((g, gi) => g.questions.forEach((_, qi) => { if (a2[gi * 6 + qi] > 0) s[g.type] += a2[gi * 6 + qi] }))
  CAREER_PAIRS.forEach(([, t1, , t2], i) => { if (a3[i] === 0) s[t1] += 4; else if (a3[i] === 1) s[t2] += 4 })
  return s
}

function HollandRadar({ scores }: { scores: Record<HollandType, number> }) {
  const cx = 140, cy = 140, r = 100
  const max = Math.max(...Object.values(scores), 1)
  const pt = (i: number, scale: number) => {
    const a = (i * 60 - 90) * (Math.PI / 180)
    return { x: cx + r * scale * Math.cos(a), y: cy + r * scale * Math.sin(a) }
  }
  return (
    <svg viewBox="0 0 280 280" className="w-56 h-56 flex-shrink-0">
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={TYPES.map((_, i) => { const p = pt(i, s); return `${p.x},${p.y}` }).join(" ")} fill="none" stroke="#E2E8F0" strokeWidth="1" />
      ))}
      {TYPES.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="1" /> })}
      <polygon points={TYPES.map((t, i) => { const p = pt(i, scores[t] / max); return `${p.x},${p.y}` }).join(" ")} fill="#4361EE" fillOpacity="0.25" stroke="#4361EE" strokeWidth="2" />
      {TYPES.map((t, i) => { const p = pt(i, scores[t] / max); return <circle key={t} cx={p.x} cy={p.y} r="4" fill="#4361EE" /> })}
      {TYPES.map((t, i) => { const p = pt(i, 1.3); return <text key={t} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={TYPE_INFO[t].color}>{t}</text> })}
    </svg>
  )
}

interface CareerTestModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  viewResults?: boolean  // true = skip to saved results, false = start fresh test
}

export function CareerTestModal({ isOpen, onClose, onComplete, viewResults = false }: CareerTestModalProps) {
  const [step, setStep] = useState(0)
  const [answers1, setAnswers1] = useState<number[]>(Array(36).fill(0))
  const [answers2, setAnswers2] = useState<number[]>(Array(36).fill(0))
  const [answers3, setAnswers3] = useState<number[]>(Array(42).fill(-1))
  const [submitting, setSubmitting] = useState(false)
  const [savedScores, setSavedScores] = useState<Record<HollandType, number> | null>(null)
  const [savedCode, setSavedCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setAnswers1(Array(36).fill(0))
    setAnswers2(Array(36).fill(0))
    setAnswers3(Array(42).fill(-1))
    setSubmitting(false)

    if (viewResults) {
      setStep(4)
      setSavedScores(null)
      setSavedCode("")
      setLoading(true)
      fetch("/api/career-test")
        .then(r => r.json())
        .then(d => {
          if (d.result?.scores) {
            setSavedScores(d.result.scores)
            setSavedCode(d.result.hollandCode ?? "")
          }
        })
        .finally(() => setLoading(false))
    } else {
      setStep(0)
      setSavedScores(null)
      setSavedCode("")
      setLoading(false)
    }
  }, [isOpen, viewResults])

  if (!isOpen) return null

  const done1 = answers1.filter(v => v > 0).length
  const done2 = answers2.filter(v => v > 0).length
  const done3 = answers3.filter(v => v >= 0).length

  // Use saved scores when viewing results, computed scores when finishing test
  const computedScores = step === 4 && !viewResults ? computeScores(answers1, answers2, answers3) : null
  const activeScores = savedScores ?? computedScores
  const ranked = activeScores ? (Object.entries(activeScores) as [HollandType, number][]).sort((a, b) => b[1] - a[1]) : []
  const hollandCode = savedCode || ranked.slice(0, 3).map(([t]) => t).join("")
  const dominant = ranked[0]?.[0] as HollandType | undefined

  const handleSubmit = async () => {
    if (!computedScores) return
    setSubmitting(true)
    try {
      await fetch("/api/career-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hollandCode, scores: computedScores }),
      })
      onComplete?.()
    } finally {
      setSubmitting(false)
    }
  }

  const progressPct = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : step === 4 ? 100 : 0

  const scrollTop = () => {
    document.getElementById("career-modal-scroll")?.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#E2E8F0] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <span className="font-semibold text-[#0F172A] text-sm">
            {viewResults ? "Мэргэжил сонголтын тестийн хариу" : "Мэргэжил сонголтын тест"}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <X className="w-4 h-4 text-[#64748B]" />
        </button>
      </div>

      {/* Progress bar (test mode only) */}
      {!viewResults && step > 0 && (
        <div className="flex-shrink-0 bg-white border-b border-[#F1F5F9] px-6 pb-3 pt-2">
          <div className="flex items-center justify-between mb-1.5 max-w-2xl">
            {["Сонирхол", "Чадвар", "Мэргэжлийн хос", "Дүгнэлт"].map((label, i) => (
              <span key={label} className={cn("text-[11px] font-medium", step > i ? "text-[#4361EE]" : "text-[#94A3B8]")}>{label}</span>
            ))}
          </div>
          <div className="h-1.5 bg-[#E2E8F0] rounded-full max-w-2xl">
            <div className="h-1.5 bg-[#4361EE] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div id="career-modal-scroll" className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#4361EE] animate-spin" />
              <p className="text-sm text-[#64748B]">Хариу уншиж байна...</p>
            </div>
          )}

          {/* Step 0: Intro */}
          {!loading && step === 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#7C3AED]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-2">Дж. Холландын мэргэжил сонголтын тест</h2>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  Энэхүү тест таны сонирхол, чадвар, мэргэжлийн уг сурвалжид нийцсэн Holland
                  код болон мэргэжлийн чиглэлийг тодорхойлоход туслана.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-left">
                {[
                  { n: "1", t: "Тест №1", s: "Таны сонирхол (36 асуулт)" },
                  { n: "2", t: "Тест №2", s: "Таны чадвар (36 асуулт)" },
                  { n: "3", t: "Тест №3", s: "Мэргэжлийн хос (42 хос)" },
                ].map(x => (
                  <div key={x.n} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                    <div className="w-6 h-6 rounded-lg bg-[#EDE9FE] flex items-center justify-center mb-2">
                      <span className="text-xs font-bold text-[#7C3AED]">{x.n}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0F172A]">{x.t}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{x.s}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)}
                className="w-full py-2.5 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2 text-sm">
                Тест эхлэх <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1 & 2: Rating questions */}
          {!loading && (step === 1 || step === 2) && (() => {
            const groups = step === 1 ? TEST1_GROUPS : TEST2_GROUPS
            const answers = step === 1 ? answers1 : answers2
            const setAnswers = step === 1 ? setAnswers1 : setAnswers2
            const answered = step === 1 ? done1 : done2
            const title = step === 1 ? "Тест №1 — Таны сонирхол" : "Тест №2 — Таны чадвар"
            const subtitle = step === 1 ? "Та дараах үйл ажиллагааг хэр их сонирхдог вэ?" : "Та дараах ур чадваруудыг хэр сайн эзэмшсэн бэ?"

            return (
              <>
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                  <h2 className="font-bold text-[#0F172A] mb-1">{title}</h2>
                  <p className="text-sm text-[#64748B] mb-3">{subtitle}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                    {RATINGS.map(r => (
                      <span key={r.value} className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md border-2 border-[#E2E8F0] flex items-center justify-center font-bold text-[#0F172A] text-xs">{r.value}</span>
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>

                {groups.map((group, gi) => (
                  <div key={group.type} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#E2E8F0]" style={{ background: TYPE_INFO[group.type].bg }}>
                      <span className="text-sm font-semibold" style={{ color: TYPE_INFO[group.type].color }}>{group.label}</span>
                    </div>
                    <div className="divide-y divide-[#F1F5F9]">
                      {group.questions.map((q, qi) => {
                        const idx = gi * 6 + qi
                        const val = answers[idx]
                        return (
                          <div key={qi} className="flex items-center gap-3 px-4 py-3">
                            <span className="flex-1 text-sm text-[#0F172A]">{q}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {RATINGS.map(r => (
                                <button key={r.value}
                                  onClick={() => { const n = [...answers]; n[idx] = r.value; setAnswers(n) }}
                                  className={cn("w-8 h-8 rounded-lg border-2 text-sm font-bold transition-all",
                                    val === r.value ? "border-[#4361EE] bg-[#4361EE] text-white" : "border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]"
                                  )}>
                                  {r.value}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] px-5 py-3">
                  <button onClick={() => { setStep(step - 1); scrollTop() }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Буцах
                  </button>
                  <span className="text-xs text-[#64748B]">{answered}/36 хариулсан</span>
                  <button disabled={answered < 36} onClick={() => { setStep(step + 1); scrollTop() }}
                    className={cn("flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors",
                      answered === 36 ? "bg-[#4361EE] text-white hover:bg-[#3451D1]" : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                    )}>
                    Дараах <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )
          })()}

          {/* Step 3: Career pairs */}
          {!loading && step === 3 && (
            <>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <h2 className="font-bold text-[#0F172A] mb-1">Тест №3 — Мэргэжлийн сонголт</h2>
                <p className="text-sm text-[#64748B]">Хос бүрт та аль мэргэжлийг илүүд үзэж байна вэ?</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] divide-y divide-[#F1F5F9]">
                {CAREER_PAIRS.map(([c1, t1, c2, t2], i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                    <span className="text-[11px] text-[#94A3B8] w-5 flex-shrink-0 text-right">{i + 1}.</span>
                    {([{ career: c1, type: t1, choice: 0 }, { career: c2, type: t2, choice: 1 }] as const).map(({ career, type, choice }) => (
                      <button key={choice}
                        onClick={() => { const n = [...answers3]; n[i] = choice; setAnswers3(n) }}
                        className={cn("flex-1 py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all text-left",
                          answers3[i] === choice ? "border-[#4361EE] bg-[#EEF1FD] text-[#3451D1]" : "border-[#E2E8F0] text-[#0F172A] hover:border-[#4361EE] hover:bg-[#F8FAFC]"
                        )}>
                        <span className="block truncate">{career}</span>
                        <span className="text-[10px] font-normal mt-0.5 block" style={{ color: TYPE_INFO[type].color }}>{TYPE_INFO[type].fullLabel}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] px-5 py-3">
                <button onClick={() => { setStep(2); scrollTop() }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Буцах
                </button>
                <span className="text-xs text-[#64748B]">{done3}/42 хариулсан</span>
                <button disabled={done3 < 42} onClick={() => { setStep(4); scrollTop() }}
                  className={cn("flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors",
                    done3 === 42 ? "bg-[#4361EE] text-white hover:bg-[#3451D1]" : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                  )}>
                  Дүгнэлт харах <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 4: Results */}
          {!loading && step === 4 && activeScores && dominant && (
            <>
              <div className="bg-gradient-to-br from-[#EEF1FD] to-[#E0E7FF] rounded-2xl p-5 text-center border border-[#C7D2F8]">
                <p className="text-xs font-semibold text-[#3451D1] uppercase tracking-wide mb-3">Таны Holland код</p>
                <div className="flex items-center justify-center gap-3 mb-3">
                  {hollandCode.split("").map(t => (
                    <div key={t} className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black"
                      style={{ background: TYPE_INFO[t as HollandType].bg, color: TYPE_INFO[t as HollandType].color, border: `2px solid ${TYPE_INFO[t as HollandType].border}` }}>
                      {t}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#64748B]">{ranked.slice(0, 3).map(([t]) => TYPE_INFO[t].fullLabel).join(" · ")}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <h3 className="font-semibold text-[#0F172A] mb-4">Оноо</h3>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <HollandRadar scores={activeScores} />
                  <div className="flex-1 w-full space-y-2">
                    {ranked.map(([type, score]) => {
                      const pct = Math.round((score / (48 + 48 + 56)) * 100)
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: TYPE_INFO[type as HollandType].color }}>
                              {type} — {TYPE_INFO[type as HollandType].fullLabel}
                            </span>
                            <span className="text-xs text-[#64748B]">{pct}%</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: TYPE_INFO[type as HollandType].color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5"
                style={{ borderLeftWidth: 4, borderLeftColor: TYPE_INFO[dominant].color }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                    style={{ background: TYPE_INFO[dominant].bg, color: TYPE_INFO[dominant].color }}>
                    {dominant}
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A]">{TYPE_INFO[dominant].fullLabel} хэв шинж</p>
                    <p className="text-xs text-[#64748B]">Таны давамгайлсан зан чанар</p>
                  </div>
                </div>
                <p className="text-sm text-[#0F172A] leading-relaxed">{TYPE_INFO[dominant].desc}</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <h3 className="font-semibold text-[#0F172A] mb-3">Санал болгох мэргэжлүүд</h3>
                <div className="space-y-3">
                  {ranked.slice(0, 3).map(([type]) => (
                    <div key={type}>
                      <p className="text-xs font-semibold mb-2" style={{ color: TYPE_INFO[type as HollandType].color }}>
                        {type} — {TYPE_INFO[type as HollandType].fullLabel}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TYPE_INFO[type as HollandType].careers.map(c => (
                          <span key={c} className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: TYPE_INFO[type as HollandType].bg, color: TYPE_INFO[type as HollandType].color }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer: view mode vs test mode */}
              <div className="flex items-center gap-3 pb-4">
                {viewResults ? (
                  <button onClick={onClose}
                    className="flex-1 py-2.5 bg-[#4361EE] text-white font-semibold rounded-xl hover:bg-[#3451D1] transition-colors text-sm">
                    Хаах
                  </button>
                ) : (
                  <>
                    <button onClick={() => { setStep(3); scrollTop() }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Буцах
                    </button>
                    <button onClick={handleSubmit} disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4361EE] text-white font-semibold rounded-xl hover:bg-[#3451D1] transition-colors disabled:opacity-60 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {submitting ? "Хадгалж байна..." : "Дүгнэлт хадгалж дуусгах"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* No saved result found */}
          {!loading && step === 4 && viewResults && !activeScores && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
              <Sparkles className="w-10 h-10 text-[#C4B5FD] mx-auto mb-3" />
              <p className="font-semibold text-[#0F172A] mb-1">Хариу олдсонгүй</p>
              <p className="text-sm text-[#64748B] mb-4">Та тестийг өгөөгүй байна</p>
              <button onClick={onClose}
                className="px-5 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:bg-[#6D28D9] transition-colors">
                Хаах
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
