"use client"

const colors = [
  { name: "Primary", hex: "#A8B5E0", label: "Lavender", textClass: "text-[#3D3A3A]" },
  { name: "Primary Dark", hex: "#6B7FB8", label: "Lavender Dark", textClass: "text-white" },
  { name: "Primary Light", hex: "#E8ECF7", label: "Lavender Light", textClass: "text-[#3D3A3A]" },
  { name: "Success", hex: "#B8D8BA", label: "Mint", textClass: "text-[#3D3A3A]" },
  { name: "Success Light", hex: "#DFEDE0", label: "Mint Light", textClass: "text-[#3D3A3A]" },
  { name: "Warning", hex: "#F5D76E", label: "Yellow", textClass: "text-[#3D3A3A]" },
  { name: "Warning Light", hex: "#FDF4D9", label: "Yellow Light", textClass: "text-[#3D3A3A]" },
  { name: "Danger", hex: "#E8A5A5", label: "Coral", textClass: "text-[#3D3A3A]" },
  { name: "Danger Light", hex: "#F7DDDD", label: "Coral Light", textClass: "text-[#3D3A3A]" },
  { name: "Secondary", hex: "#F4C2C2", label: "Peach", textClass: "text-[#3D3A3A]" },
  { name: "Background", hex: "#FAF8F5", label: "Cream", textClass: "text-[#3D3A3A]", border: true },
  { name: "Surface", hex: "#FFFFFF", label: "White", textClass: "text-[#3D3A3A]", border: true },
  { name: "Border", hex: "#EAE6E0", label: "Sand", textClass: "text-[#3D3A3A]", border: true },
  { name: "Text", hex: "#3D3A3A", label: "Charcoal", textClass: "text-white" },
  { name: "Text Muted", hex: "#8B8680", label: "Stone", textClass: "text-white" },
]

export function DSColors() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#3D3A3A] mb-1">1. Өнгөний палитр</h2>
      <p className="text-sm text-[#8B8680] mb-5">Color Palette</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {colors.map((c) => (
          <div key={c.hex} className="rounded-xl overflow-hidden shadow-sm border border-[#EAE6E0]">
            <div
              className="h-16 w-full"
              style={{ backgroundColor: c.hex, border: c.border ? "1px solid #EAE6E0" : undefined }}
            />
            <div className="bg-white px-3 py-2">
              <p className="text-[11px] font-semibold text-[#3D3A3A] leading-tight">{c.name}</p>
              <p className="text-[10px] text-[#8B8680]">{c.label}</p>
              <p className="text-[10px] font-mono text-[#6B7FB8] mt-0.5">{c.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
