import OpenAI from "openai"
import { NextRequest, NextResponse } from "next/server"

const SCHOOL_KB = `
sc1 | Harvard University | АНУ | Ranking: #1
Admission Rate: 3.4% | Avg GPA: 3.9 | Avg SAT: 1510
Scholarship: Тийм, need-based, жилд $65,000 хүртэл
Strengths: Хуули, Анагаах, Business, Эдийн засаг, Шинжлэх ухаан, Liberal Arts
Notes: Дэлхийн хамгийн өрсөлдөөнтэй сургууль. GPA 3.8+, SAT 1490+ шаардлагатай. Гаргалгааны хурдан туршлага, манлайлал, өвөрмөц түүх чухал.

sc2 | Stanford University | АНУ | Ranking: #3
Admission Rate: 3.7% | Avg GPA: 3.96 | Avg SAT: 1520
Scholarship: Тийм, need-based, жилд $60,000 хүртэл
Strengths: STEM, Computer Science, Инженерчлэл, Бизнес, Инновац
Notes: Технологийн чиглэлд хамгийн хүчтэй. SAT 1490+, GPA 3.8+ шаардлагатай. Бүтээлч сэтгэлгээ, инновацийн чадвар чухал.

sc3 | MIT | АНУ | Ranking: #2
Admission Rate: 3.9% | Avg GPA: 3.95 | Avg SAT: 1535
Scholarship: Need-based тэтгэлэг
Strengths: Инженерчлэл, Computer Science, Математик, Физик, Байгалийн шинжлэх ухаан
Notes: Техникийн чиглэлд дэлхийн тэргүүний сургууль. Олимпиадын медаль, судалгааны туршлага давуу тал болно. SAT 1500+ хамгийн тохиромжтой.

sc4 | University of Michigan | АНУ | Ranking: #25
Admission Rate: 17% | Avg GPA: 3.7 | Avg SAT: 1435
Scholarship: Тийм, merit+need, жилд $15,000 хүртэл
Strengths: Инженерчлэл, CS, Business (Ross), Хуули, Анагаах, Нийгмийн бодлого
Notes: Боломжтой үнэ цэнтэй их сургууль. GPA 3.5+, SAT 1350+ байвал тохирно. Судалгааны боломж сайн.

sc5 | University of Toronto | Канад | Ranking: #34
Admission Rate: 43% | Avg GPA: 3.6 | Avg SAT: 1300
Scholarship: Merit болон need-based тэтгэлэг байдаг
Strengths: Байгалийн шинжлэх ухаан, Анагаах, Инженерчлэл, Хүмүүнлэгийн ухаан, CS
Notes: Канадын тэргүүний их сургууль. АНУ-ын элитэ сургуулиудаас хүртээмжтэй. GPA 3.4+ байвал хангалттай.

sc6 | Oxford University | Их Британи | Ranking: #4
Admission Rate: 17% | Avg GPA: 3.85 | Avg SAT: 1490
Scholarship: Тийм, жилд £10,000 хүртэл
Strengths: Хуули, Анагаах, Байгалийн шинжлэх ухаан, Хүмүүнлэг, Философи
Notes: Их Британийн тэргүүний их сургууль. Tutorial систем бие даасан суралцахуйг шаарддаг. Олон улсын оюутнуудад маш өрсөлдөөнтэй. GPA 3.7+, SAT 1450+ шаардлагатай.

sc7 | University of Washington | АНУ | Ranking: #58
Admission Rate: 52% | Avg GPA: 3.5 | Avg SAT: 1280
Scholarship: Need-based хязгаарлагдмал
Strengths: Computer Science, Инженерчлэл, Анагаах, Бизнес
Notes: Microsoft, Amazon зэрэг технологийн компаниудтай ойрхон байрлах нь CS, инженерийн оюутнуудад давуу тал. GPA 3.3+ байвал хүлээн авах магадлал өндөр.

sc8 | Seoul National University | Солонгос | Ranking: #42
Admission Rate: 15% | Avg GPA: 3.7 | Avg SAT: 1350
Scholarship: Засгийн газар болон их сургуулийн тэтгэлэг, жилд ₩5,000,000
Strengths: Байгалийн шинжлэх ухаан, Инженерчлэл, Анагаах, Хуули, Бизнес
Notes: Зүүн Азийн тэргүүний их сургуулиудын нэг. Баруун орнуудтай харьцуулахад хямд. Солонгос хэл мэдэхгүй байсан ч Англи хэлний хөтөлбөрүүд байдаг.

sc9 | University of Melbourne | Австрали | Ranking: #38
Admission Rate: 70% | Avg GPA: 3.4 | Avg SAT: 1200
Scholarship: Хязгаарлагдмал need-based
Strengths: Анагаах, Байгалийн шинжлэх ухаан, Бизнес, Хуули, Урлаг
Notes: Австралийн тэргүүний их сургуулиудын нэг. Хамгийн хүртээмжтэй сургуулиудын нэг. Melbourne Model (breadth curriculum) онцлогтой. GPA 3.2+ байвал тохирно.

sc10 | Yale University | АНУ | Ranking: #5
Admission Rate: 4.6% | Avg GPA: 3.94 | Avg SAT: 1510
Scholarship: Тийм, need-based, жилд $70,000 хүртэл
Strengths: Хуули, Хүмүүнлэг, Урлаг, Нийгмийн шинжлэх ухаан, Анагаах, Бизнес
Notes: Liberal arts, Хуулийн чиглэлд алдартай. Маш өгөөмөр санхүүгийн тусламж. Цогц үнэлгээний системтэй. GPA 3.8+, SAT 1490+ хамгийн тохиромжтой.
`

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY тохируулаагүй байна. .env.local файлаа шалгана уу." }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const profile = await req.json()

    const avgGpa = [profile.gpa?.y10, profile.gpa?.y11, profile.gpa?.y12]
      .filter(Boolean)
      .map(Number)
      .reduce((a, b, _, arr) => a + b / arr.length, 0)
      .toFixed(2)

    const prompt = `Та Монгол оюутны коллеж элсэлтийн зөвлөх мэргэжилтэн. Доорх их сургуулийн мэдээллийн санг ашиглан оюутны профайлд тулгуурлан тохирох байдлыг дүгнэ.

СУРГУУЛИЙН МЭДЭЭЛЛИЙН САН:
${SCHOOL_KB}

ОЮУТНЫ ПРОФАЙЛ:
- GPA дундаж: ${avgGpa} (10-р анги: ${profile.gpa?.y10 || "байхгүй"}, 11-р анги: ${profile.gpa?.y11 || "байхгүй"}, 12-р анги: ${profile.gpa?.y12 || "байхгүй"})
- SAT: ${profile.scores?.sat || "байхгүй"}, ACT: ${profile.scores?.act || "байхгүй"}
- TOEFL: ${profile.scores?.toefl || "байхгүй"}, IELTS: ${profile.scores?.ielts || "байхгүй"}
- Гадуурх үйл ажиллагаа: ${profile.activities?.filter((a: {name: string}) => a.name).map((a: {name: string; role: string}) => `${a.name} (${a.role})`).join(", ") || "байхгүй"}
- Сонирхсон мэргэжил: ${profile.selectedMajors?.join(", ") || "тодорхойлоогүй"}
- Санхүүгийн хэрэгцээ: ${profile.financialNeed || "medium"} (жилд $${(profile.aidAmount || 50) * 200})
- Хүссэн сургуулиуд: ${profile.wishSchools?.filter(Boolean).join(", ") || "байхгүй"}

АНГИЛАЛЫН ЗААВАР:
- "safety": Оюутны үзүүлэлт сургуулийн дунджаас тодорхой давсан (элсэлтийн хувь 40%+ ЭСВЭЛ GPA дундаж + 0.25+)
- "match": Оюутны үзүүлэлт сургуулийн дунджтай ойролцоо (GPA ±0.2, SAT ±100)
- "reach": Оюутны үзүүлэлт сургуулийн дундажаас доогуур ЭСВЭЛ элсэлтийн хувь 10%-иас бага

Бүх 10 сургуулийг дүгнэж, дараах JSON форматаар хариул:
{
  "schools": [
    {"id": "sc1", "type": "reach", "matchConfidence": 65, "reasoning": "Монгол хэлээр 1-2 өгүүлбэр тайлбар"},
    {"id": "sc2", "type": "reach", "matchConfidence": 60, "reasoning": "..."},
    {"id": "sc3", "type": "reach", "matchConfidence": 58, "reasoning": "..."},
    {"id": "sc4", "type": "match", "matchConfidence": 78, "reasoning": "..."},
    {"id": "sc5", "type": "match", "matchConfidence": 85, "reasoning": "..."},
    {"id": "sc6", "type": "reach", "matchConfidence": 62, "reasoning": "..."},
    {"id": "sc7", "type": "safety", "matchConfidence": 92, "reasoning": "..."},
    {"id": "sc8", "type": "match", "matchConfidence": 80, "reasoning": "..."},
    {"id": "sc9", "type": "safety", "matchConfidence": 95, "reasoning": "..."},
    {"id": "sc10", "type": "reach", "matchConfidence": 63, "reasoning": "..."}
  ],
  "summary": "Монгол хэлээр 2-3 өгүүлбэр нийт дүгнэлт"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Та коллеж элсэлтийн зөвлөх. JSON форматаар хариулна уу." },
        { role: "user", content: prompt },
      ],
    })

    const raw = completion.choices[0].message.content ?? "{}"
    const result = JSON.parse(raw)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Recommend API error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
