"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppTopbar } from "@/components/app-topbar"
import { Check, ChevronRight, ChevronLeft, Plus, Trash2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const steps = [
  { id: 1, label: "GPA", sublabel: "Дүн" },
  { id: 2, label: "Test Scores", sublabel: "Шалгалт" },
  { id: 3, label: "Extracurricular", sublabel: "Үйл ажиллагаа" },
  { id: 4, label: "Мэргэжил", sublabel: "Сонирхол" },
  { id: 5, label: "Санхүү", sublabel: "Тусламж" },
  { id: 6, label: "Сургуулиуд", sublabel: "Жагсаалт" },
]

const gradeYears = ["10-р анги", "11-р анги", "12-р анги"]
const majors = ["Computer Science", "Engineering", "Business", "Medicine", "Law", "Arts", "Economics", "Mathematics", "Physics", "Biology"]

export default function StudentAcademicPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [gpa, setGpa] = useState({ y10: "", y11: "", y12: "" })

  // Pre-fill GPA from DB academic history set by admin
  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}`)
      .then(r => r.json())
      .then(d => {
        const history: { gradeYear: string; gpa?: number }[] = d.user?.academicHistory ?? []
        const y10 = history.find(h => h.gradeYear === "10")?.gpa
        const y11 = history.find(h => h.gradeYear === "11")?.gpa
        const y12 = history.find(h => h.gradeYear === "12")?.gpa
        if (y10 != null || y11 != null || y12 != null) {
          setGpa({
            y10: y10 != null ? String(y10) : "",
            y11: y11 != null ? String(y11) : "",
            y12: y12 != null ? String(y12) : "",
          })
        } else {
          // fallback to localStorage
          const saved = localStorage.getItem("studentAcademicProfile")
          if (saved) {
            try { const p = JSON.parse(saved); if (p.gpa) setGpa(p.gpa) } catch { /* ignore */ }
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem("studentAcademicProfile")
        if (saved) {
          try { const p = JSON.parse(saved); if (p.gpa) setGpa(p.gpa) } catch { /* ignore */ }
        }
      })
  }, [user?.id])
  const [scores, setScores] = useState({ sat: "", act: "", toefl: "", ielts: "" })
  const [activities, setActivities] = useState([{ name: "", role: "", years: "" }])
  const [selectedMajors, setSelectedMajors] = useState<string[]>([])
  const [financialNeed, setFinancialNeed] = useState("medium")
  const [aidAmount, setAidAmount] = useState(50)
  const [wishSchools, setWishSchools] = useState<string[]>(["University of Michigan", "University of Toronto"])

  const addActivity = () => setActivities(a => [...a, { name: "", role: "", years: "" }])
  const removeActivity = (i: number) => setActivities(a => a.filter((_, idx) => idx !== i))
  const toggleMajor = (m: string) => setSelectedMajors(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const canPrev = currentStep > 1

  const saveProfile = () => {
    localStorage.setItem("studentAcademicProfile", JSON.stringify({ gpa, scores, activities, selectedMajors, financialNeed, aidAmount, wishSchools }))
  }

  const handleGetAI = () => {
    saveProfile()
    router.push("/student/ai-recommendations")
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Академик мэдээлэл" breadcrumb={["Сурагч", "Академик"]} />

      <div className="flex-1 p-6">
        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  currentStep === step.id ? "bg-[#4361EE] border-[#4361EE] text-white" :
                  step.id < currentStep ? "bg-[#B8D8BA] border-[#B8D8BA] text-white" :
                  "bg-white border-[#E2E8F0] text-[#64748B]"
                )}>
                  {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={cn("text-xs font-medium whitespace-nowrap", currentStep === step.id ? "text-[#3451D1]" : "text-[#64748B]")}>
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2 min-w-[32px]", step.id < currentStep ? "bg-[#B8D8BA]" : "bg-[#E2E8F0]")} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] card-shadow max-w-2xl">
          {/* Step header */}
          <div className="p-6 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-bold text-[#0F172A]">{steps[currentStep-1].label}</h2>
            <p className="text-sm text-[#64748B] mt-0.5">Алхам {currentStep} / {steps.length}</p>
          </div>

          <div className="p-6">
            {/* Step 1: GPA */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] mb-4">3 жилийн голч дүнгээ (GPA) оруулна уу</p>
                {gradeYears.map((year, i) => {
                  const key = i === 0 ? "y10" : i === 1 ? "y11" : "y12"
                  return (
                    <div key={year}>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{year}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={gpa[key as keyof typeof gpa]}
                        onChange={e => setGpa(g => ({ ...g, [key]: e.target.value }))}
                        placeholder="3.80"
                        className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Step 2: Test scores */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] mb-4">Шалгалтын оноог оруулна уу</p>
                {[
                  { key: "sat", label: "SAT", placeholder: "1450", max: "1600" },
                  { key: "act", label: "ACT", placeholder: "32", max: "36" },
                  { key: "toefl", label: "TOEFL", placeholder: "105", max: "120" },
                  { key: "ielts", label: "IELTS", placeholder: "7.5", max: "9.0" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{label}</label>
                    <input
                      type="number"
                      value={scores[key as keyof typeof scores]}
                      onChange={e => setScores(s => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Extracurricular */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] mb-4">Гадуурх үйл ажиллагаагаа нэмнэ үү</p>
                {activities.map((act, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-xl p-4 space-y-3 relative">
                    <button onClick={() => removeActivity(i)} className="absolute top-3 right-3 text-[#64748B] hover:text-[#C0504D] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Нэр</label>
                      <input value={act.name} onChange={e => { const a = [...activities]; a[i].name = e.target.value; setActivities(a) }}
                        placeholder="Олимпиад, клуб, спорт..."
                        className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Үүрэг</label>
                        <input value={act.role} onChange={e => { const a = [...activities]; a[i].role = e.target.value; setActivities(a) }}
                          placeholder="Дарга, гишүүн..."
                          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Жил</label>
                        <input value={act.years} onChange={e => { const a = [...activities]; a[i].years = e.target.value; setActivities(a) }}
                          placeholder="2023–2026"
                          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addActivity} className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E2E8F0] text-sm text-[#3451D1] font-medium hover:border-[#4361EE] transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Нэмэх
                </button>
              </div>
            )}

            {/* Step 4: Major */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] mb-4">Сонирхож буй мэргэжлүүдээ сонгоно уу</p>
                <div className="flex flex-wrap gap-2">
                  {majors.map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMajor(m)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        selectedMajors.includes(m)
                          ? "bg-[#4361EE] border-[#4361EE] text-white"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {selectedMajors.length > 0 && (
                  <p className="text-xs text-[#3451D1] font-medium">{selectedMajors.length} мэргэжил сонгосон</p>
                )}
              </div>
            )}

            {/* Step 5: Financial need */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <p className="text-sm text-[#64748B] mb-4">Санхүүгийн тусламж шаардлагатай эсэхийг тодорхойлно уу</p>
                <div className="space-y-3">
                  {[
                    { id: "none", label: "Санхүүгийн тусламж шаардлагагүй", sub: "Бүрэн өртгийг хариуцна" },
                    { id: "low", label: "Бага хэмжээний тусламж хэрэгтэй", sub: "20–40% тусламж" },
                    { id: "medium", label: "Дунд хэмжээний тусламж хэрэгтэй", sub: "40–70% тусламж" },
                    { id: "high", label: "Их хэмжээний тусламж шаардлагатай", sub: "70–100% тусламж" },
                  ].map(opt => (
                    <label key={opt.id} className={cn("flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      financialNeed === opt.id ? "border-[#4361EE] bg-[#EEF1FD]" : "border-[#E2E8F0] hover:border-[#4361EE]"
                    )}>
                      <input type="radio" value={opt.id} checked={financialNeed === opt.id} onChange={e => setFinancialNeed(e.target.value)} className="mt-0.5 accent-[#4361EE]" />
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{opt.label}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-3">Жилийн хэмжээ: <span className="text-[#3451D1]">${aidAmount * 200}</span></label>
                  <input type="range" min={0} max={100} value={aidAmount} onChange={e => setAidAmount(+e.target.value)}
                    className="w-full accent-[#4361EE]" />
                  <div className="flex justify-between text-xs text-[#64748B] mt-1">
                    <span>$0</span><span>$10,000</span><span>$20,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Wish list */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] mb-4">Орох хүссэн сургуулиудаа нэмнэ үү</p>
                <div className="relative">
                  <input
                    placeholder="Сургуулийн нэр хайх..."
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  {wishSchools.map((school, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-4 py-3 border border-[#E2E8F0]">
                      <span className="text-sm text-[#0F172A] font-medium">{school}</span>
                      <button onClick={() => setWishSchools(s => s.filter((_, idx) => idx !== i))}
                        className="text-[#64748B] hover:text-[#C0504D] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setWishSchools(s => [...s, ""])}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#E2E8F0] text-sm text-[#3451D1] font-medium hover:border-[#4361EE] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Сургууль нэмэх
                </button>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center gap-3 p-6 border-t border-[#E2E8F0]">
            <button
              disabled={!canPrev}
              onClick={() => setCurrentStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Өмнөх
            </button>
            <button onClick={saveProfile} className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors ml-auto">
              Хадгалах
            </button>
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4361EE] text-white font-semibold text-sm hover:bg-[#3451D1] transition-colors"
              >
                Дараах <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGetAI}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3451D1] text-white font-semibold text-sm hover:bg-[#4A5F9A] transition-colors"
              >
                <Sparkles className="w-4 h-4" /> AI Зөвлөмж авах
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
