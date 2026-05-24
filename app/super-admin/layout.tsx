import { AppSidebar } from "@/components/app-sidebar"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#131826] overflow-hidden">
      <AppSidebar role="super-admin" />
      <main className="flex-1 overflow-y-auto bg-[#0F1220]">
        {children}
      </main>
    </div>
  )
}
