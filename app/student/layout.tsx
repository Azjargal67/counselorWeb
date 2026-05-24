import { AppSidebar } from "@/components/app-sidebar"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <AppSidebar role="student" />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
