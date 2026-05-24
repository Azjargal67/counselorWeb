export type Role = "student" | "counselor" | "teacher" | "admin" | "super-admin"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  grade?: string
  school?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: "essay" | "cv" | "transcript" | "recommendation" | "test-prep" | "interview" | "other"
  status: "todo" | "in-progress" | "done" | "overdue"
  deadline: string
  priority: "low" | "medium" | "high"
  progress: number // 1-5 stars
  studentId: string
  counselorId: string
  createdAt: string
  notes?: string
}

export interface School {
  id: string
  name: string
  country: string
  ranking: number
  admissionRate: number
  avgGpa: number
  avgSat: number
  hasScholarship: boolean
  scholarshipAmount?: string
  logo?: string
  type: "safety" | "match" | "reach"
  matchConfidence: number
  applicationStatus?: "researching" | "applied" | "waiting" | "accepted" | "rejected"
  deadline?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: Role
  content: string
  timestamp: string
  read: boolean
  attachments?: { name: string; size: string; type: string }[]
}

export interface Conversation {
  id: string
  participants: { id: string; name: string; role: Role; avatar?: string; online: boolean }[]
  lastMessage: string
  lastTime: string
  unread: number
}

export interface RecommendationRequest {
  id: string
  studentId: string
  studentName: string
  teacherId: string
  teacherName: string
  school: string
  deadline: string
  status: "pending" | "writing" | "sent" | "rejected"
  message: string
  createdAt: string
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  { id: "s1", name: "Болормаа Дорж", email: "bolormaa@edu.mn", role: "student", grade: "12-р анги", school: "Монгол сургууль", status: "active", createdAt: "2025-09-01" },
  { id: "s2", name: "Номин Батбаяр", email: "nomin@edu.mn", role: "student", grade: "12-р анги", school: "Монгол сургууль", status: "active", createdAt: "2025-09-01" },
  { id: "s3", name: "Тунгалаг Ганбаатар", email: "tungalag@edu.mn", role: "student", grade: "11-р анги", school: "Монгол сургууль", status: "active", createdAt: "2025-09-01" },
  { id: "s4", name: "Эрдэнэ Сүхбаатар", email: "erdene@edu.mn", role: "student", grade: "12-р анги", school: "Монгол сургууль", status: "active", createdAt: "2025-09-01" },
  { id: "s5", name: "Мөнхцэцэг Лхагва", email: "munkh@edu.mn", role: "student", grade: "11-р анги", school: "Монгол сургууль", status: "inactive", createdAt: "2025-09-01" },
  { id: "s6", name: "Оюунчимэг Бат", email: "oyun@edu.mn", role: "student", grade: "12-р анги", school: "Монгол сургууль", status: "active", createdAt: "2025-09-01" },
  { id: "c1", name: "Мөнхзул Ганзориг", email: "munkhzul@edu.mn", role: "counselor", school: "Монгол сургууль", status: "active", createdAt: "2024-08-01" },
  { id: "c2", name: "Отгонбаяр Нарантуяа", email: "otgon@edu.mn", role: "counselor", school: "Монгол сургууль", status: "active", createdAt: "2024-08-01" },
  { id: "t1", name: "Дэлгэрмаа Чимэд", email: "delger@edu.mn", role: "teacher", school: "Монгол сургууль", status: "active", createdAt: "2024-08-01" },
  { id: "t2", name: "Баярмаа Содном", email: "bayar@edu.mn", role: "teacher", school: "Монгол сургууль", status: "active", createdAt: "2024-08-01" },
  { id: "a1", name: "Цэрэндорж Лувсан", email: "tserendorj@edu.mn", role: "admin", school: "Монгол сургууль", status: "active", createdAt: "2024-01-01" },
  { id: "sa1", name: "Super Admin", email: "admin@educounsel.mn", role: "super-admin", status: "active", createdAt: "2024-01-01" },
]

export const currentStudent = mockUsers[0]
export const currentCounselor = mockUsers[6]
export const currentTeacher = mockUsers[8]
export const currentAdmin = mockUsers[10]

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  { id: "tk1", title: "Common App Essay бичих", description: "550 үгтэй личность эссэ бичнэ. Өөрийн гэрийн соёл, уламжлалын тухай бичнэ үү.", category: "essay", status: "in-progress", deadline: "2026-05-15", priority: "high", progress: 3, studentId: "s1", counselorId: "c1", createdAt: "2026-04-01", notes: "3-р хувилбарт хүрсэн. Дараагийнх хамт хэлэлцэнэ." },
  { id: "tk2", title: "CV шинэчлэх", description: "Академик амжилт, олимпиад, туршлага нэмэх.", category: "cv", status: "done", deadline: "2026-04-20", priority: "medium", progress: 5, studentId: "s1", counselorId: "c1", createdAt: "2026-03-10" },
  { id: "tk3", title: "SAT шалгалтанд бэлдэх", description: "Khan Academy-н 8 өдрийн курс дуусгах.", category: "test-prep", status: "in-progress", deadline: "2026-05-01", priority: "high", progress: 2, studentId: "s1", counselorId: "c1", createdAt: "2026-04-05" },
  { id: "tk4", title: "Багшийн зөвлөмж захидал хүсэх", description: "Математикийн багш Дэлгэрмаа багшаас recommendation letter авах.", category: "recommendation", status: "todo", deadline: "2026-05-20", priority: "medium", progress: 1, studentId: "s1", counselorId: "c1", createdAt: "2026-04-10" },
  { id: "tk5", title: "Transcript орчуулах", description: "Монгол transcript-ийг баталгаажуулан орчуулах.", category: "transcript", status: "overdue", deadline: "2026-04-10", priority: "high", progress: 1, studentId: "s1", counselorId: "c1", createdAt: "2026-03-20" },
  { id: "tk6", title: "MIT Application эссэ", description: "Ямар асуудал шийдэхийг хүсч байгаа талаар бичнэ.", category: "essay", status: "todo", deadline: "2026-06-01", priority: "medium", progress: 1, studentId: "s1", counselorId: "c1", createdAt: "2026-04-15" },
  { id: "tk7", title: "Интервьюнд бэлдэх", description: "Yale-ийн alumni interview-нд бэлдэх.", category: "interview", status: "todo", deadline: "2026-05-25", priority: "low", progress: 1, studentId: "s1", counselorId: "c1", createdAt: "2026-04-18" },
  { id: "tk8", title: "Финансийн тусламж хүсэх маягт", description: "CSS Profile бөглөнө.", category: "other", status: "in-progress", deadline: "2026-05-10", priority: "high", progress: 2, studentId: "s2", counselorId: "c1", createdAt: "2026-04-08" },
  { id: "tk9", title: "Personal Statement", description: "UCAS personal statement бичих.", category: "essay", status: "done", deadline: "2026-04-15", priority: "high", progress: 5, studentId: "s2", counselorId: "c1", createdAt: "2026-03-05" },
]

// ─── Schools ──────────────────────────────────────────────────────────────────

export const mockSchools: School[] = [
  { id: "sc1", name: "Harvard University", country: "АНУ", ranking: 1, admissionRate: 3.4, avgGpa: 3.9, avgSat: 1510, hasScholarship: true, scholarshipAmount: "$65,000/жил", type: "reach", matchConfidence: 62, applicationStatus: "researching", deadline: "2026-01-01" },
  { id: "sc2", name: "Stanford University", country: "АНУ", ranking: 3, admissionRate: 3.7, avgGpa: 3.96, avgSat: 1520, hasScholarship: true, scholarshipAmount: "$60,000/жил", type: "reach", matchConfidence: 58, applicationStatus: "researching" },
  { id: "sc3", name: "MIT", country: "АНУ", ranking: 2, admissionRate: 3.9, avgGpa: 3.95, avgSat: 1535, hasScholarship: false, type: "reach", matchConfidence: 55 },
  { id: "sc4", name: "University of Michigan", country: "АНУ", ranking: 25, admissionRate: 17, avgGpa: 3.7, avgSat: 1435, hasScholarship: true, scholarshipAmount: "$15,000/жил", type: "match", matchConfidence: 78, applicationStatus: "applied", deadline: "2026-02-01" },
  { id: "sc5", name: "University of Toronto", country: "Канад", ranking: 34, admissionRate: 43, avgGpa: 3.6, avgSat: 1300, hasScholarship: false, type: "match", matchConfidence: 85, applicationStatus: "waiting" },
  { id: "sc6", name: "Oxford University", country: "Их Британи", ranking: 4, admissionRate: 17, avgGpa: 3.85, avgSat: 1490, hasScholarship: true, scholarshipAmount: "£10,000/жил", type: "reach", matchConfidence: 60 },
  { id: "sc7", name: "University of Washington", country: "АНУ", ranking: 58, admissionRate: 52, avgGpa: 3.5, avgSat: 1280, hasScholarship: false, type: "safety", matchConfidence: 92, applicationStatus: "accepted" },
  { id: "sc8", name: "Seoul National University", country: "Солонгос", ranking: 42, admissionRate: 15, avgGpa: 3.7, avgSat: 1350, hasScholarship: true, scholarshipAmount: "₩5,000,000/жил", type: "match", matchConfidence: 80, applicationStatus: "rejected" },
  { id: "sc9", name: "University of Melbourne", country: "Австрали", ranking: 38, admissionRate: 70, avgGpa: 3.4, avgSat: 1200, hasScholarship: false, type: "safety", matchConfidence: 95 },
  { id: "sc10", name: "Yale University", country: "АНУ", ranking: 5, admissionRate: 4.6, avgGpa: 3.94, avgSat: 1510, hasScholarship: true, scholarshipAmount: "$70,000/жил", type: "reach", matchConfidence: 61 },
]

// ─── Conversations / Messages ─────────────────────────────────────────────────

export const mockConversations: Conversation[] = [
  { id: "cv1", participants: [{ id: "c1", name: "Мөнхзул багш", role: "counselor", online: true }], lastMessage: "Эссэний 3-р хувилбарыг харлаа. Маш сайн болжээ!", lastTime: "10:32", unread: 2 },
  { id: "cv2", participants: [{ id: "s2", name: "Номин Батбаяр", role: "student", online: false }], lastMessage: "Deadline мартаагүй биздээ?", lastTime: "Өчигдөр", unread: 0 },
  { id: "cv3", participants: [{ id: "t1", name: "Дэлгэрмаа багш", role: "teacher", online: true }], lastMessage: "Захидлаа явуулах болно.", lastTime: "2 өдрийн өмнө", unread: 1 },
]

export const mockMessages: Message[] = [
  { id: "m1", senderId: "c1", senderName: "Мөнхзул багш", senderRole: "counselor", content: "Сайн байна уу, Болормаа! Common App эссэний шинэ хувилбараа явуулаарай.", timestamp: "2026-04-22 09:15", read: true },
  { id: "m2", senderId: "s1", senderName: "Болормаа", senderRole: "student", content: "Сайн байна аа багш. Өнөөдөр орой явуулна.", timestamp: "2026-04-22 09:45", read: true },
  { id: "m3", senderId: "c1", senderName: "Мөнхзул багш", senderRole: "counselor", content: "Эссэний 3-р хувилбарыг харлаа. Маш сайн болжээ! Зөвхөн дүгнэлтийн хэсгийг арай тодруулах хэрэгтэй.", timestamp: "2026-04-22 10:32", read: false },
]

// ─── Recommendation Requests ─────────────────────────────────────────────────

export const mockRecommendationRequests: RecommendationRequest[] = [
  { id: "rr1", studentId: "s1", studentName: "Болормаа Дорж", teacherId: "t1", teacherName: "Дэлгэрмаа Чимэд", school: "Harvard University", deadline: "2026-05-15", status: "writing", message: "Багш та намайг 3 жил математикийн хичээлд орж байхыг мэддэг.", createdAt: "2026-04-10" },
  { id: "rr2", studentId: "s2", studentName: "Номин Батбаяр", teacherId: "t1", teacherName: "Дэлгэрмаа Чимэд", school: "Stanford University", deadline: "2026-05-20", status: "pending", message: "Физикийн олимпиадад хамтран ажилласан тухай бичиж өгнө үү.", createdAt: "2026-04-18" },
  { id: "rr3", studentId: "s3", studentName: "Тунгалаг Ганбаатар", teacherId: "t2", teacherName: "Баярмаа Содном", school: "Oxford University", deadline: "2026-06-01", status: "sent", message: "Англи хэлний хичээлдээ идэвхтэй оролцдог байсан.", createdAt: "2026-04-05" },
]

// ─── Stat helpers ─────────────────────────────────────────────────────────────

export const studentStats = {
  total: 24,
  done: 18,
  upcoming: 3,
  overdue: 1,
  progress: 75,
}

export const counselorStats = {
  students: 32,
  tasks: 48,
  messages: 7,
  weeklyActivity: 12,
}

export const teacherStats = {
  newRequests: 4,
  writing: 2,
  sent: 28,
  avgDays: 3,
}

export const adminStats = {
  counselors: 12,
  students: 284,
  tasks: 1847,
  successRate: 68,
}

export const superAdminStats = {
  schools: 24,
  active: 22,
  users: 3420,
  revenue: "₮12.4M",
}

// ─── Teachers for recommendation ─────────────────────────────────────────────

export const teachers = [
  { id: "t1", name: "Дэлгэрмаа Чимэд", subjects: ["Математик", "Статистик"], rating: 4.9, responseTime: "2-3 өдөр", lettersSent: 34, availability: true },
  { id: "t2", name: "Баярмаа Содном", subjects: ["Англи хэл", "Уран зохиол"], rating: 4.7, responseTime: "3-5 өдөр", lettersSent: 28, availability: true },
  { id: "t3", name: "Ганчимэг Пүрэв", subjects: ["Физик", "Хими"], rating: 4.8, responseTime: "1-2 өдөр", lettersSent: 19, availability: false },
]

// ─── Document files ───────────────────────────────────────────────────────────

export const mockDocuments = [
  { id: "d1", name: "Common_App_Essay_v3.pdf", type: "essay", size: "124 KB", date: "2026-04-22", category: "Essay", version: 3 },
  { id: "d2", name: "CV_Bolormaa_2026.pdf", type: "cv", size: "89 KB", date: "2026-04-20", category: "CV", version: 2 },
  { id: "d3", name: "Transcript_Official.pdf", type: "transcript", size: "456 KB", date: "2026-04-10", category: "Transcript", version: 1 },
  { id: "d4", name: "IELTS_Score_Report.pdf", type: "other", size: "234 KB", date: "2026-03-15", category: "Бусад", version: 1 },
  { id: "d5", name: "Harvard_Essay_Why.pdf", type: "essay", size: "98 KB", date: "2026-04-18", category: "Essay", version: 1 },
  { id: "d6", name: "Recommendation_Delger.pdf", type: "recommendation", size: "67 KB", date: "2026-04-12", category: "Recommendation", version: 1 },
  { id: "d7", name: "SAT_Score_Report.pdf", type: "other", size: "189 KB", date: "2026-03-01", category: "Бусад", version: 1 },
  { id: "d8", name: "Personal_Statement_v2.pdf", type: "essay", size: "112 KB", date: "2026-04-19", category: "Essay", version: 2 },
]

// ─── Super admin school tenants ───────────────────────────────────────────────

export const mockTenants = [
  { id: "ten1", name: "Монгол сургууль", plan: "Pro", counselors: 12, students: 284, storage: "4.2 GB", startDate: "2025-09-01", endDate: "2026-08-31", status: "active" },
  { id: "ten2", name: "Улаанбаатар Хотын Сургууль", plan: "Enterprise", counselors: 8, students: 156, storage: "2.8 GB", startDate: "2025-09-01", endDate: "2026-08-31", status: "active" },
  { id: "ten3", name: "Орхон Сургууль", plan: "Basic", counselors: 3, students: 45, storage: "0.6 GB", startDate: "2025-10-01", endDate: "2026-04-30", status: "expiring" },
  { id: "ten4", name: "Дархан Олон Улсын Сургууль", plan: "Pro", counselors: 5, students: 89, storage: "1.4 GB", startDate: "2025-08-01", endDate: "2026-07-31", status: "active" },
  { id: "ten5", name: "Эрдэнэт Боловсрол", plan: "Basic", counselors: 2, students: 28, storage: "0.3 GB", startDate: "2026-01-01", endDate: "2026-06-30", status: "active" },
]
