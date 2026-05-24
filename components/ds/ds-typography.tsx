"use client"

const typeScale = [
  { tag: "H1", size: "32px", weight: "Bold (700)", lh: "40px", sample: "Элсэлтийн зөвлөгөө", className: "text-[32px] font-bold leading-[40px]" },
  { tag: "H2", size: "24px", weight: "Bold (700)", lh: "32px", sample: "Их сургуулиуд", className: "text-[24px] font-bold leading-[32px]" },
  { tag: "H3", size: "20px", weight: "SemiBold (600)", lh: "28px", sample: "Элсэлтийн шалгуур", className: "text-[20px] font-semibold leading-[28px]" },
  { tag: "H4", size: "16px", weight: "SemiBold (600)", lh: "24px", sample: "Хичээлийн жилийн төлөвлөгөө", className: "text-[16px] font-semibold leading-[24px]" },
  { tag: "Body Large", size: "16px", weight: "Regular (400)", lh: "24px", sample: "Монгол улсын их сургуулиудад элсэхэд шаардагдах материалыг бэлтгэх.", className: "text-[16px] font-normal leading-[24px]" },
  { tag: "Body", size: "14px", weight: "Regular (400)", lh: "20px", sample: "Бүртгэлийн хугацааг алдахгүйн тулд цаг тухайд нь материалаа бэлтгэнэ үү.", className: "text-[14px] font-normal leading-[20px]" },
  { tag: "Caption", size: "12px", weight: "Regular (400)", lh: "16px", sample: "Шаардлагатай баримт бичгүүдийг цаг тухайд нь бэлтгэнэ үү.", className: "text-[12px] font-normal leading-[16px]" },
  { tag: "Button", size: "14px", weight: "Medium (500)", lh: "—", sample: "Бүртгүүлэх", className: "text-[14px] font-medium" },
]

export function DSTypography() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#3D3A3A] mb-1">2. Бичгийн хэлбэр</h2>
      <p className="text-sm text-[#8B8680] mb-5">Typography — Inter font throughout</p>
      <div className="bg-white rounded-2xl border border-[#EAE6E0] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAE6E0] bg-[#FAF8F5]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8B8680] uppercase tracking-wider w-24">Хэлбэр</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8B8680] uppercase tracking-wider w-24">Хэмжээ</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8B8680] uppercase tracking-wider w-32">Жин</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8B8680] uppercase tracking-wider hidden md:table-cell">Жишээ</th>
            </tr>
          </thead>
          <tbody>
            {typeScale.map((t, i) => (
              <tr key={t.tag} className={i !== typeScale.length - 1 ? "border-b border-[#EAE6E0]" : ""}>
                <td className="px-5 py-4">
                  <span className="text-[11px] font-mono bg-[#E8ECF7] text-[#6B7FB8] px-2 py-0.5 rounded">{t.tag}</span>
                </td>
                <td className="px-5 py-4 text-[#8B8680] text-xs">{t.size}</td>
                <td className="px-5 py-4 text-[#8B8680] text-xs">{t.weight}</td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className={`${t.className} text-[#3D3A3A]`}>{t.sample}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
