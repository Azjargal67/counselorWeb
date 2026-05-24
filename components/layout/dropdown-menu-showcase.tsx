import {
  UserCircle,
  Settings,
  Bell,
  FileText,
  LogOut,
  Trash2,
} from "lucide-react"

type MenuItem = {
  icon: React.ElementType
  label: string
  danger?: boolean
  dividerBefore?: boolean
}

const menuItems: MenuItem[] = [
  { icon: UserCircle, label: "Профайл харах" },
  { icon: Settings, label: "Тохиргоо" },
  { icon: Bell, label: "Мэдэгдлийн тохиргоо" },
  { icon: FileText, label: "Тайлан татах", dividerBefore: true },
  { icon: Trash2, label: "Устгах", danger: true },
  { icon: LogOut, label: "Гарах", danger: true },
]

export function DropdownMenuShowcase() {
  return (
    <div className="inline-flex flex-col">
      <div className="w-[240px] bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1.5 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label}>
              {item.dividerBefore && (
                <div className="my-1.5 border-t border-[#E2E8F0]" />
              )}
              <button
                className={`w-full flex items-center gap-3 px-4 h-10 text-sm transition-colors ${
                  item.danger
                    ? "text-[#D97B6C] hover:bg-[#FFF0EE]"
                    : "text-[#1A1A1A] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
