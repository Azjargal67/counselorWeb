export interface SchoolData {
  id: string
  name: string
  country: string
  ranking: number
  admissionRate: number
  avgGpa: number
  avgSat: number
  hasScholarship: boolean
  scholarshipAmount: string
  website: string
  domain: string
  strengths: string[]
  description: string
  deadline: string
  location: string
  brandColor: string
}

export const SCHOOL_LIST: SchoolData[] = [
  {
    id: "sc1", name: "Harvard University", country: "АНУ", ranking: 1,
    admissionRate: 3.4, avgGpa: 3.9, avgSat: 1510,
    hasScholarship: true, scholarshipAmount: "жилд $65,000 хүртэл",
    website: "https://www.harvard.edu", domain: "harvard.edu",
    strengths: ["Хуули", "Анагаах ухаан", "Business", "Эдийн засаг", "Liberal Arts"],
    description: "1636 онд үүсгэн байгуулагдсан АНУ-ын хамгийн эртний их сургууль. 8 ерөнхийлөгч, 160 гаруй Нобелийн шагналт төгсөгчтэй. Дэлхийд хамгийн өрсөлдөөнтэй.",
    deadline: "RD: Январь 1", location: "Cambridge, Massachusetts",
    brandColor: "#A51C30",
  },
  {
    id: "sc2", name: "Stanford University", country: "АНУ", ranking: 3,
    admissionRate: 3.7, avgGpa: 3.96, avgSat: 1520,
    hasScholarship: true, scholarshipAmount: "жилд $60,000 хүртэл",
    website: "https://www.stanford.edu", domain: "stanford.edu",
    strengths: ["STEM", "Computer Science", "Инженерчлэл", "Бизнес", "Инновац"],
    description: "Silicon Valley-н зүрхэнд оршдог технологи болон инновацийн тэргүүн сургууль. Google, HP, Nike зэрэг компаниудын үүсгэн байгуулагчид төгссөн.",
    deadline: "RD: Январь 2", location: "Stanford, California",
    brandColor: "#8C1515",
  },
  {
    id: "sc3", name: "MIT", country: "АНУ", ranking: 2,
    admissionRate: 3.9, avgGpa: 3.95, avgSat: 1535,
    hasScholarship: true, scholarshipAmount: "Need-based тэтгэлэг",
    website: "https://www.mit.edu", domain: "mit.edu",
    strengths: ["Инженерчлэл", "Computer Science", "Математик", "Физик", "Байгалийн ухаан"],
    description: "Massachusetts Institute of Technology — техникийн чиглэлд дэлхийн тэргүүн. 99 Нобелийн шагналт, 26 Тьюрингийн шагналт төгсөгчтэй.",
    deadline: "RD: Январь 1", location: "Cambridge, Massachusetts",
    brandColor: "#A31F34",
  },
  {
    id: "sc4", name: "University of Michigan", country: "АНУ", ranking: 25,
    admissionRate: 17, avgGpa: 3.7, avgSat: 1435,
    hasScholarship: true, scholarshipAmount: "жилд $15,000 хүртэл",
    website: "https://www.umich.edu", domain: "umich.edu",
    strengths: ["Инженерчлэл", "CS", "Ross Business School", "Хуули", "Анагаах"],
    description: "АНУ-ын тэргүүний нийтийн их сургуулиудын нэг. Ross School of Business болон Engineering-ээрээ алдартай. Larry Page, Ford зэрэг алдартнууд төгссөн.",
    deadline: "RD: Февраль 1", location: "Ann Arbor, Michigan",
    brandColor: "#00274C",
  },
  {
    id: "sc5", name: "University of Toronto", country: "Канад", ranking: 34,
    admissionRate: 43, avgGpa: 3.6, avgSat: 1300,
    hasScholarship: true, scholarshipAmount: "Merit болон need-based",
    website: "https://www.utoronto.ca", domain: "utoronto.ca",
    strengths: ["Байгалийн ухаан", "Анагаах", "Инженерчлэл", "Хүмүүнлэг", "CS"],
    description: "Канадын тэргүүний нийтийн их сургууль. АНУ-ын нэр хүндтэй сургуулиудтай харьцуулахад хүртээмжтэй. 10 Нобелийн шагналтантай.",
    deadline: "RD: Январь 15", location: "Toronto, Ontario",
    brandColor: "#002A5C",
  },
  {
    id: "sc6", name: "Oxford University", country: "Их Британи", ranking: 4,
    admissionRate: 17, avgGpa: 3.85, avgSat: 1490,
    hasScholarship: true, scholarshipAmount: "жилд £10,000 хүртэл",
    website: "https://www.ox.ac.uk", domain: "ox.ac.uk",
    strengths: ["Хуули", "Анагаах ухаан", "Байгалийн ухаан", "Хүмүүнлэг", "Философи"],
    description: "1096 онд үүсгэн байгуулагдсан Английн хэлтэй орнуудын хамгийн эртний их сургууль. 72 Нобелийн шагналт, 28 Британийн ерөнхий сайд төгссөн.",
    deadline: "UCAS: Октябрь 15", location: "Oxford, England",
    brandColor: "#002147",
  },
  {
    id: "sc7", name: "University of Washington", country: "АНУ", ranking: 58,
    admissionRate: 52, avgGpa: 3.5, avgSat: 1280,
    hasScholarship: true, scholarshipAmount: "Need-based хязгаарлагдмал",
    website: "https://www.washington.edu", domain: "washington.edu",
    strengths: ["Computer Science", "Инженерчлэл", "Анагаах", "Бизнес"],
    description: "Seattle-д байрладаг технологийн компаниудтай ойрхон сургууль. Paul Allen CS Center-тай. Microsoft, Amazon, Boeing зэрэгтэй хамтын ажиллагаатай.",
    deadline: "RD: Ноябрь 15", location: "Seattle, Washington",
    brandColor: "#4B2E83",
  },
  {
    id: "sc8", name: "Seoul National University", country: "Солонгос", ranking: 42,
    admissionRate: 15, avgGpa: 3.7, avgSat: 1350,
    hasScholarship: true, scholarshipAmount: "жилд ₩5,000,000",
    website: "https://www.snu.ac.kr", domain: "snu.ac.kr",
    strengths: ["Байгалийн ухаан", "Инженерчлэл", "Анагаах", "Хуули", "Бизнес"],
    description: "Солонгосын тэргүүний нийтийн их сургууль. Зүүн Азийн шилдэг. Монгол оюутнуудад Солонгос засгийн газрын KGSP тэтгэлэг авах боломжтой.",
    deadline: "РД: Сентябрь 30", location: "Seoul, South Korea",
    brandColor: "#0C4DA2",
  },
  {
    id: "sc9", name: "University of Melbourne", country: "Австрали", ranking: 38,
    admissionRate: 70, avgGpa: 3.4, avgSat: 1200,
    hasScholarship: true, scholarshipAmount: "Need-based хязгаарлагдмал",
    website: "https://www.unimelb.edu.au", domain: "unimelb.edu.au",
    strengths: ["Анагаах", "Байгалийн ухаан", "Бизнес", "Хуули", "Урлаг"],
    description: "Австралийн 2-р тэргүүний их сургууль. Melbourne Model (breadth curriculum) онцлогтой. Олон улсын оюутнуудад маш нээлттэй орчинтой.",
    deadline: "RD: Октябрь 31", location: "Melbourne, Victoria",
    brandColor: "#003765",
  },
  {
    id: "sc10", name: "Yale University", country: "АНУ", ranking: 5,
    admissionRate: 4.6, avgGpa: 3.94, avgSat: 1510,
    hasScholarship: true, scholarshipAmount: "жилд $70,000 хүртэл",
    website: "https://www.yale.edu", domain: "yale.edu",
    strengths: ["Хуули", "Хүмүүнлэг", "Урлаг", "Нийгмийн ухаан", "Анагаах"],
    description: "1701 онд үүсгэн байгуулагдсан Ivy League их сургууль. Liberal arts болон хуулийн чиглэлд тэргүүлдэг. Жилийн санхүүгийн тусламж маш өгөөмөр.",
    deadline: "RD: Январь 2", location: "New Haven, Connecticut",
    brandColor: "#0F4D92",
  },
]
