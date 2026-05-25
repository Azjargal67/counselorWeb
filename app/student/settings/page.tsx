"use client"

import { useState, useEffect } from "react"
import { AppTopbar } from "@/components/app-topbar"
import {
  User, Lock, Bell, Globe, Shield, ChevronRight,
  Camera, Save, Eye, EyeOff, CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

type SettingSection = "profile" | "security" | "notifications" | "language"

const SECTIONS = [
  { key: "profile" as const, label: "Профайл мэдээлэл", icon: User },
  { key: "security" as const, label: "Нууц үг & Аюулгүй байдал", icon: Lock },
  { key: "notifications" as const, label: "Мэдэгдлийн тохиргоо", icon: Bell },
  { key: "language" as const, label: "Хэл & Бүс нутаг", icon: Globe },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#64748B] mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {sub && <p className="text-xs text-[#64748B]">{sub}</p>}
      </div>
      <button
        onClick={onChange}
        className={cn("w-11 h-6 rounded-full transition-colors relative flex-shrink-0", value ? "bg-[#4361EE]" : "bg-[#E2E8F0]")}
      >
        <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  )
}

export default function StudentSettingsPage() {
  const [section, setSection] = useState<SettingSection>("profile")
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [profile, setProfile] = useState({ name: "Болормаа Дорж", email: "bolormaa@edu.mn", phone: "+976 9911 2233", grade: "12-р анги", bio: "STEM чиглэлд сонирхолтой сурагч." })
  const [notifs, setNotifs] = useState({ tasks: true, messages: true, deadlines: true, email: false, weekly: true })
  const [emailReminders, setEmailReminders] = useState(false)
  const [reminderDays, setReminderDays] = useState(3)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savedNotif, setSavedNotif] = useState(false)
  const [lang, setLang] = useState("mn")

  useEffect(() => {
    fetch("/api/users/settings").then(r => r.json()).then(d => {
      setEmailReminders(d.emailReminders ?? false)
      setReminderDays(d.reminderDays ?? 3)
    }).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      <AppTopbar title="Тохиргоо" />

      <div className="flex-1 p-6 flex gap-6">
        {/* Left nav */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] card-shadow overflow-hidden">
            {SECTIONS.map(s => {
              const Icon = s.icon
              const active = section === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors border-b border-[#E2E8F0] last:border-0",
                    active ? "bg-[#EEF1FD] text-[#3451D1] font-semibold" : "text-[#64748B] hover:bg-[#F8FAFC]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#3451D1]" : "text-[#64748B]")} />
                  <span className="flex-1 truncate">{s.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-[#3451D1]" />}
                </button>
              )
            })}
          </div>

          {/* Danger zone */}
          <div className="mt-4 bg-white rounded-xl border border-[#F4C2C2] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#C0504D]" />
              <p className="text-xs font-semibold text-[#C0504D]">Аюулын бүс</p>
            </div>
            <button className="w-full text-xs text-[#C0504D] bg-[#F7DDDD] hover:bg-[#F4C2C2] py-2 rounded-lg transition-colors font-medium">
              Бүртгэл устгах
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-5">

          {section === "profile" && (
            <>
              <SectionCard title="Хувийн мэдээлэл">
                {/* Avatar */}
                <div className="flex items-center gap-5 pb-5 border-b border-[#E2E8F0]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-[#4361EE] flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">{profile.name.charAt(0)}</span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors shadow-sm">
                      <Camera className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{profile.name}</p>
                    <p className="text-sm text-[#64748B]">{profile.grade} · Сурагч</p>
                    <button className="text-xs text-[#3451D1] hover:underline mt-1">Зураг солих</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Овог нэр">
                    <input
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                    />
                  </FormField>
                  <FormField label="Имэйл">
                    <input
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                    />
                  </FormField>
                  <FormField label="Утасны дугаар">
                    <input
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                    />
                  </FormField>
                  <FormField label="Анги">
                    <select
                      value={profile.grade}
                      onChange={e => setProfile(p => ({ ...p, grade: e.target.value }))}
                      className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] bg-white transition-colors"
                    >
                      <option>10-р анги</option>
                      <option>11-р анги</option>
                      <option>12-р анги</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Тухай (Bio)" hint="Зөвлөхдөө харагдана">
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors resize-none"
                  />
                </FormField>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#8FA3D8] transition-colors">
                    <Save className="w-4 h-4" />
                    Хадгалах
                  </button>
                </div>
              </SectionCard>
            </>
          )}

          {section === "security" && (
            <SectionCard title="Нууц үг солих">
              <FormField label="Одоогийн нууц үг">
                <div className="relative">
                  <input
                    type={showOldPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 pr-10 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                  />
                  <button onClick={() => setShowOldPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showOldPw ? <EyeOff className="w-4 h-4 text-[#64748B]" /> : <Eye className="w-4 h-4 text-[#64748B]" />}
                  </button>
                </div>
              </FormField>
              <FormField label="Шинэ нууц үг" hint="Наад зах нь 8 тэмдэгт, тоо болон үсэг агуулсан байх">
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full border border-[#E2E8F0] rounded-xl px-3 pr-10 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                  />
                  <button onClick={() => setShowNewPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showNewPw ? <EyeOff className="w-4 h-4 text-[#64748B]" /> : <Eye className="w-4 h-4 text-[#64748B]" />}
                  </button>
                </div>
              </FormField>
              <FormField label="Шинэ нууц үг давтах">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] transition-colors"
                />
              </FormField>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#8FA3D8] transition-colors">
                  <Save className="w-4 h-4" />
                  Нууц үг шинэчлэх
                </button>
              </div>
            </SectionCard>
          )}

          {section === "notifications" && (
            <>
              <SectionCard title="Апп мэдэгдэл">
                <div className="space-y-4 divide-y divide-[#E2E8F0]">
                  <Toggle value={notifs.tasks} onChange={() => setNotifs(n => ({ ...n, tasks: !n.tasks }))} label="Даалгаврын мэдэгдэл" sub="Шинэ даалгавар нэмэгдэх, статус өөрчлөгдөх үед" />
                  <div className="pt-4"><Toggle value={notifs.messages} onChange={() => setNotifs(n => ({ ...n, messages: !n.messages }))} label="Мессежийн мэдэгдэл" sub="Шинэ мессеж ирэх үед" /></div>
                  <div className="pt-4"><Toggle value={notifs.weekly} onChange={() => setNotifs(n => ({ ...n, weekly: !n.weekly }))} label="7 хоногийн тайлан" sub="Долоо хоног тутамд явцын тайлан" /></div>
                </div>
              </SectionCard>

              <SectionCard title="И-мэйл сануулга">
                <div className="space-y-5">
                  <Toggle
                    value={emailReminders}
                    onChange={() => setEmailReminders(v => !v)}
                    label="Deadline и-мэйл сануулга"
                    sub="Deadline-аас өмнө и-мэйлээр сануулга авах"
                  />

                  {emailReminders && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#0F172A] mb-3">
                        Deadline-аас хэдэн өдрийн өмнө сануулга илгээх?
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 5, 7, 14].map(d => (
                          <button
                            key={d}
                            onClick={() => setReminderDays(d)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                              reminderDays === d
                                ? "border-[#4361EE] bg-[#EEF1FD] text-[#3451D1]"
                                : "border-[#E2E8F0] text-[#64748B] hover:border-[#4361EE]/50"
                            )}
                          >
                            {d} өдөр
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[#64748B] mt-3">
                        Deadline-аас <strong>{reminderDays} өдрийн өмнө</strong> өглөө 8:00 цагт и-мэйл ирнэ.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div />
                    <div className="flex items-center gap-3">
                      {savedNotif && (
                        <span className="flex items-center gap-1.5 text-xs text-[#4A8C4D] font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Хадгалагдлаа
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          setSavingNotif(true)
                          await fetch("/api/users/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ emailReminders, reminderDays }),
                          })
                          setSavingNotif(false)
                          setSavedNotif(true)
                          setTimeout(() => setSavedNotif(false), 3000)
                        }}
                        disabled={savingNotif}
                        className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#3451D1] transition-colors disabled:opacity-60"
                      >
                        <Save className="w-4 h-4" />
                        {savingNotif ? "Хадгалж байна..." : "Хадгалах"}
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {section === "language" && (
            <SectionCard title="Хэл & Бүс нутаг">
              <FormField label="Систем хэл">
                <div className="grid grid-cols-2 gap-3">
                  {[{ code: "mn", label: "Монгол", sub: "Кирилл" }, { code: "en", label: "English", sub: "Latin" }].map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={cn(
                        "border-2 rounded-xl p-4 text-left transition-all",
                        lang === l.code ? "border-[#4361EE] bg-[#EEF1FD]" : "border-[#E2E8F0] hover:border-[#4361EE]/50"
                      )}
                    >
                      <p className={cn("text-sm font-semibold", lang === l.code ? "text-[#3451D1]" : "text-[#0F172A]")}>{l.label}</p>
                      <p className="text-xs text-[#64748B]">{l.sub}</p>
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Цагийн бүс">
                <select className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#4361EE] bg-white transition-colors">
                  <option>UTC+8 — Улаанбаатар</option>
                  <option>UTC+0 — Лондон</option>
                  <option>UTC-5 — Нью-Йорк</option>
                </select>
              </FormField>
              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#4361EE] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#8FA3D8] transition-colors">
                  <Save className="w-4 h-4" />
                  Хадгалах
                </button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
