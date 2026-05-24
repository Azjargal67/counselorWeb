import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { Task } from "@/lib/models/Task"
import { Document } from "@/lib/models/Document"
import { RecommendationRequest } from "@/lib/models/RecommendationRequest"
import { AdmissionResult } from "@/lib/models/AdmissionResult"
import { Tenant } from "@/lib/models/Tenant"
import { Conversation } from "@/lib/models/Conversation"
import { Message } from "@/lib/models/Message"

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Production дээр ажиллахгүй" }, { status: 403 })
  }

  await connectDB()

  await User.deleteMany({})
  await Task.deleteMany({})
  await Document.deleteMany({})
  await RecommendationRequest.deleteMany({})
  await AdmissionResult.deleteMany({})
  await Tenant.deleteMany({})
  await Conversation.deleteMany({})
  await Message.deleteMany({})

  const hash = (pw: string) => bcrypt.hash(pw, 12)

  const users = await User.insertMany([
    { name: "Болормаа Дорж",      email: "student@educounsel.mn",    password: await hash("student123"),    role: "student",    grade: "12-р анги", gpa: 3.85, sat: 1420, status: "active" },
    { name: "Номин Батбаяр",      email: "student2@educounsel.mn",   password: await hash("student123"),    role: "student",    grade: "11-р анги", gpa: 3.72, sat: 1380, status: "active" },
    { name: "Тунгалаг Ганбаатар", email: "student3@educounsel.mn",   password: await hash("student123"),    role: "student",    grade: "11-р анги", gpa: 3.91, sat: 1460, status: "active" },
    { name: "Эрдэнэ Сүхбаатар",  email: "student4@educounsel.mn",   password: await hash("student123"),    role: "student",    grade: "12-р анги", gpa: 3.60, sat: 1310, status: "active" },
    { name: "Мөнхцэцэг Лхагва",  email: "student5@educounsel.mn",   password: await hash("student123"),    role: "student",    grade: "11-р анги", gpa: 3.45, sat: 1260, status: "inactive" },
    { name: "Мөнхзул Ганзориг",  email: "counselor@educounsel.mn",  password: await hash("counselor123"),  role: "counselor",  status: "active" },
    { name: "Дэлгэрмаа Чимэд",   email: "teacher@educounsel.mn",    password: await hash("teacher123"),    role: "teacher",    status: "active" },
    { name: "Цэрэндорж Лувсан",  email: "admin@educounsel.mn",      password: await hash("admin123"),      role: "admin",      status: "active" },
    { name: "Super Admin",        email: "superadmin@educounsel.mn", password: await hash("superadmin123"), role: "super-admin",status: "active" },
  ])

  const [s1, s2, s3, s4, s5, counselor, teacher] = users

  await Task.insertMany([
    { title: "Мэргэжил сонголтын тест", description: "Дж. Холландын аргад үндэслэсэн мэргэжил сонголтын тест өгнө үү. Тест №1 (сонирхол), Тест №2 (чадвар), Тест №3 (мэргэжлийн хос) гэсэн 3 хэсгээс бүрдэнэ.", category: "career-test", status: "todo", deadline: new Date("2026-05-30"), priority: "high", progress: 0, studentId: s1._id, counselorId: counselor._id },
    { title: "Мэргэжил сонголтын тест", description: "Дж. Холландын аргад үндэслэсэн мэргэжил сонголтын тест өгнө үү. Тест №1 (сонирхол), Тест №2 (чадвар), Тест №3 (мэргэжлийн хос) гэсэн 3 хэсгээс бүрдэнэ.", category: "career-test", status: "todo", deadline: new Date("2026-05-30"), priority: "high", progress: 0, studentId: s2._id, counselorId: counselor._id },
    { title: "Мэргэжил сонголтын тест", description: "Дж. Холландын аргад үндэслэсэн мэргэжил сонголтын тест өгнө үү. Тест №1 (сонирхол), Тест №2 (чадвар), Тест №3 (мэргэжлийн хос) гэсэн 3 хэсгээс бүрдэнэ.", category: "career-test", status: "todo", deadline: new Date("2026-05-30"), priority: "high", progress: 0, studentId: s3._id, counselorId: counselor._id },
    { title: "Мэргэжил сонголтын тест", description: "Дж. Холландын аргад үндэслэсэн мэргэжил сонголтын тест өгнө үү. Тест №1 (сонирхол), Тест №2 (чадвар), Тест №3 (мэргэжлийн хос) гэсэн 3 хэсгээс бүрдэнэ.", category: "career-test", status: "todo", deadline: new Date("2026-05-30"), priority: "high", progress: 0, studentId: s4._id, counselorId: counselor._id },
    { title: "Мэргэжил сонголтын тест", description: "Дж. Холландын аргад үндэслэсэн мэргэжил сонголтын тест өгнө үү. Тест №1 (сонирхол), Тест №2 (чадвар), Тест №3 (мэргэжлийн хос) гэсэн 3 хэсгээс бүрдэнэ.", category: "career-test", status: "todo", deadline: new Date("2026-05-30"), priority: "high", progress: 0, studentId: s5._id, counselorId: counselor._id },
    { title: "Personal Statement бичих",  description: "500-650 үгтэй",            category: "essay",          status: "in-progress", deadline: new Date("2026-06-15"), priority: "high",   progress: 45, studentId: s1._id, counselorId: counselor._id },
    { title: "CV шинэчлэх",              description: "Хамгийн сүүлийн үйл ажиллагаа нэмэх", category: "cv",  status: "todo",        deadline: new Date("2026-06-01"), priority: "medium", progress: 0,  studentId: s1._id, counselorId: counselor._id },
    { title: "Transcript авах",           description: "Сургуулиас авах",           category: "transcript",     status: "done",        deadline: new Date("2026-05-20"), priority: "high",   progress: 100,studentId: s2._id, counselorId: counselor._id },
    { title: "Scholarship Essay",         description: "NSF Scholarship",           category: "essay",          status: "overdue",     deadline: new Date("2026-05-10"), priority: "high",   progress: 20, studentId: s3._id, counselorId: counselor._id },
    { title: "Интервью бэлтгэл",         description: "MIT alumni interview",      category: "interview",      status: "todo",        deadline: new Date("2026-06-05"), priority: "medium", progress: 0,  studentId: s3._id, counselorId: counselor._id },
    { title: "SAT бэлтгэл",              description: "1-р бүлэг",                category: "test-prep",      status: "done",        deadline: new Date("2026-05-01"), priority: "medium", progress: 100,studentId: s4._id, counselorId: counselor._id },
    { title: "Recommendation хүсэх",     description: "Математикийн багшаас",      category: "recommendation", status: "in-progress", deadline: new Date("2026-06-10"), priority: "low",    progress: 60, studentId: s4._id, counselorId: counselor._id },
    { title: "Common App бөглөх",        description: "Бүрэн бөглөх",             category: "other",          status: "overdue",     deadline: new Date("2026-05-15"), priority: "high",   progress: 30, studentId: s5._id, counselorId: counselor._id },
    { title: "Financial Aid хүсэлт",     description: "FAFSA",                    category: "other",          status: "todo",        deadline: new Date("2026-06-20"), priority: "medium", progress: 0,  studentId: s1._id, counselorId: counselor._id },
  ])

  await Document.insertMany([
    { name: "Personal Statement Draft 1.pdf", type: "essay",          size: "245 KB", category: "Essay",          version: "v1", studentId: s1._id },
    { name: "CV - Болормаа Дорж.docx",        type: "cv",             size: "128 KB", category: "CV",             version: "v2", studentId: s1._id },
    { name: "Official Transcript 2025.pdf",   type: "transcript",     size: "1.2 MB", category: "Transcript",     version: "v1", studentId: s1._id },
    { name: "Recommendation - Чимэд.pdf",     type: "recommendation", size: "312 KB", category: "Recommendation", version: "v1", studentId: s2._id },
    { name: "Essay - Why Michigan.pdf",       type: "essay",          size: "198 KB", category: "Essay",          version: "v2", studentId: s2._id },
    { name: "CV - Номин.pdf",                 type: "cv",             size: "156 KB", category: "CV",             version: "v1", studentId: s2._id },
  ])

  await RecommendationRequest.insertMany([
    { studentId: s1._id, studentName: s1.name, teacherId: teacher._id, teacherName: teacher.name, school: "Harvard University",       deadline: new Date("2026-06-01"), status: "writing",  message: "Математикийн хичээлд онцгой авьяастайг харуулж өгнө үү." },
    { studentId: s2._id, studentName: s2.name, teacherId: teacher._id, teacherName: teacher.name, school: "Stanford University",      deadline: new Date("2026-06-15"), status: "pending",  message: "Шинжлэх ухааны хичээлд сонирхолтойгоо тэмдэглэж өгнө үү." },
    { studentId: s3._id, studentName: s3.name, teacherId: teacher._id, teacherName: teacher.name, school: "University of Michigan",   deadline: new Date("2026-05-18"), status: "pending",  message: "Физикийн чадвараа харуулж өгнө үү." },
    { studentId: s4._id, studentName: s4.name, teacherId: teacher._id, teacherName: teacher.name, school: "University of Toronto",    deadline: new Date("2026-06-10"), status: "sent",     message: "Математикийн олимпиадад оролцсоныг тэмдэглэнэ үү." },
  ])

  await AdmissionResult.insertMany([
    { studentId: s1._id, schoolName: "University of Toronto",   country: "Канад",      status: "accepted",   scholarshipPercent: 50, scholarshipAmount: 12000000, currency: "MNT", major: "Computer Science", notes: "Маш их баяртай байна!", resultDate: "2026-03-15" },
    { studentId: s1._id, schoolName: "University of Washington", country: "АНУ",        status: "accepted",   scholarshipPercent: 30, scholarshipAmount: 8000000,  currency: "MNT", major: "Engineering",      notes: "",                      resultDate: "2026-03-20" },
    { studentId: s1._id, schoolName: "Harvard University",       country: "АНУ",        status: "rejected",   scholarshipPercent: 0,  scholarshipAmount: 0,        currency: "MNT", major: "Economics",        notes: "Дараа жил дахин оролдох",resultDate: "2026-04-01" },
    { studentId: s2._id, schoolName: "University of Melbourne",  country: "Австрали",   status: "accepted",   scholarshipPercent: 30, scholarshipAmount: 8500000,  currency: "MNT", major: "Business",         notes: "",                      resultDate: "2026-03-18" },
    { studentId: s2._id, schoolName: "Monash University",        country: "Австрали",   status: "waitlisted", scholarshipPercent: 0,  scholarshipAmount: 0,        currency: "MNT", major: "Business",         notes: "",                      resultDate: "2026-04-05" },
    { studentId: s3._id, schoolName: "Oxford University",        country: "Их Британи", status: "waitlisted", scholarshipPercent: 0,  scholarshipAmount: 0,        currency: "GBP", major: "Mathematics",      notes: "",                      resultDate: "2026-04-10" },
    { studentId: s4._id, schoolName: "Seoul National University",country: "Солонгос",   status: "accepted",   scholarshipPercent: 70, scholarshipAmount: 0,        currency: "KRW", major: "Engineering",      notes: "",                      resultDate: "2026-03-25" },
    { studentId: s4._id, schoolName: "University of Michigan",   country: "АНУ",        status: "rejected",   scholarshipPercent: 0,  scholarshipAmount: 0,        currency: "USD", major: "Engineering",      notes: "",                      resultDate: "2026-04-02" },
  ])

  // Chat seed: conversations between counselor ↔ each student, and counselor ↔ teacher
  const now = new Date()
  const mins = (n: number) => new Date(now.getTime() - n * 60000)

  type ChatUser = { _id: mongoose.Types.ObjectId; name: string; role: string }
  const chatPairs: { a: ChatUser; b: ChatUser; msgs: { from: "a" | "b"; text: string; at: Date }[] }[] = [
    {
      a: counselor, b: s1,
      msgs: [
        { from: "b", text: "Сайн байна уу, зөвлөх багш аа! Personal Statement-аа бичиж дуусгах хугацаа хэзээ вэ?", at: mins(60) },
        { from: "a", text: "Сайн уу! 6-р сарын 15-ны өдрөөс өмнө илгээгээрэй. Одоо хэр явж байна?", at: mins(55) },
        { from: "b", text: "45% дууссан байна. Товч тусламж хэрэгтэй байна.", at: mins(50) },
        { from: "a", text: "Хэзээ ч асуугаарай, туслах болно. Маргааш уулзаж ярилцъя уу?", at: mins(45) },
        { from: "b", text: "Тийм ээ, маргааш 4 цагт болох уу?", at: mins(40) },
        { from: "a", text: "Болно! Тэмдэглэж авлаа.", at: mins(35) },
      ]
    },
    {
      a: counselor, b: s2,
      msgs: [
        { from: "a", text: "Номин, транскрипт авсан уу? Задачаа шалгаж байна.", at: mins(120) },
        { from: "b", text: "Тийм, авсан. Мэйлээр илгээе үү?", at: mins(115) },
        { from: "a", text: "Тийм ээ, цахим хэлбэрээр илгээгээрэй.", at: mins(110) },
        { from: "b", text: "Хүлээж авлаа, баярлалаа!", at: mins(105) },
      ]
    },
    {
      a: counselor, b: s3,
      msgs: [
        { from: "b", text: "Scholarship Essay дутуу байна аа, яах вэ?", at: mins(200) },
        { from: "a", text: "Хугацаа өнгөрсөн байна. Дараагийн боломжид бэлтгэцгээе. Oxford-ын хугацааг анхаарч байгаарай.", at: mins(195) },
        { from: "b", text: "Ойлголоо, баярлалаа.", at: mins(190) },
      ]
    },
    {
      a: counselor, b: s4,
      msgs: [
        { from: "a", text: "Эрдэнэ, Seoul National University хүлээн авсан байна, баяр хүргэе!", at: mins(30) },
        { from: "b", text: "Баярлалаа! Маш их баяртай байна!", at: mins(25) },
        { from: "a", text: "Цаашид ч амжилт хүсье. Бичиг баримтын бэлтгэлд туслалцаа хэрэгтэй бол мэдэгдээрэй.", at: mins(20) },
      ]
    },
    {
      a: counselor, b: teacher,
      msgs: [
        { from: "a", text: "Сайн байна уу, Дэлгэрмаа багш! Номиний recommendation хэзээ бэлэн болох вэ?", at: mins(90) },
        { from: "b", text: "Долоо хоногийн дотор бэлэн болно, санаа зовох хэрэггүй.", at: mins(85) },
        { from: "a", text: "Их баярлалаа! Тунгалагийн хувьд бас хүсэлт ирсэн байна, авч үзэх үү?", at: mins(80) },
        { from: "b", text: "Тийм ээ, хүсэлтийг харсан. Хоёуланг нь хамтад нь бэлтгэнэ.", at: mins(75) },
        { from: "a", text: "Гайхалтай, баярлалаа!", at: mins(70) },
      ]
    },
  ]

  for (const pair of chatPairs) {
    const lastMsg = pair.msgs[pair.msgs.length - 1]
    const conv = await Conversation.create({
      participants: [new mongoose.Types.ObjectId(pair.a._id.toString()), new mongoose.Types.ObjectId(pair.b._id.toString())],
      lastMessage: lastMsg.text.slice(0, 100),
      lastMessageAt: lastMsg.at,
    })
    await Message.insertMany(pair.msgs.map(m => ({
      conversationId: conv._id,
      senderId: new mongoose.Types.ObjectId(m.from === "a" ? pair.a._id.toString() : pair.b._id.toString()),
      senderName: m.from === "a" ? pair.a.name : pair.b.name,
      senderRole: m.from === "a" ? pair.a.role : pair.b.role,
      content: m.text,
      read: true,
      createdAt: m.at,
    })))
  }

  await Tenant.insertMany([
    { name: "АТС Олон Улсын Сургууль",        plan: "Pro",        status: "active",   adminEmail: "admin@educounsel.mn",    counselorCount: 3,  studentCount: 5,   storageUsed: "0.2 GB", startDate: "2025-09-01", endDate: "2026-08-31" },
    { name: "Орхон Олон Улсын Сургууль",      plan: "Enterprise", status: "expiring", adminEmail: "admin@orkhon.edu.mn",   counselorCount: 8,  studentCount: 185, storageUsed: "2.8 GB", startDate: "2025-05-01", endDate: "2026-05-31" },
    { name: "Улаанбаатар Сургууль",           plan: "Pro",        status: "active",   adminEmail: "admin@ubs.edu.mn",      counselorCount: 5,  studentCount: 120, storageUsed: "1.5 GB", startDate: "2025-09-01", endDate: "2026-08-31" },
    { name: "Хан-Уул Олон Улсын Сургууль",   plan: "Pro",        status: "expiring", adminEmail: "admin@khan-uul.edu.mn", counselorCount: 6,  studentCount: 112, storageUsed: "1.9 GB", startDate: "2025-09-01", endDate: "2026-04-15" },
    { name: "Сүхбаатар Сургууль",            plan: "Enterprise", status: "active",   adminEmail: "admin@sukhbaatar.edu.mn",counselorCount: 9, studentCount: 210, storageUsed: "3.1 GB", startDate: "2025-08-01", endDate: "2026-07-31" },
    { name: "Налайх Дүүргийн Сургууль",      plan: "Basic",      status: "active",   adminEmail: "admin@nalaikh.edu.mn",  counselorCount: 3,  studentCount: 67,  storageUsed: "0.8 GB", startDate: "2025-10-01", endDate: "2026-09-30" },
    { name: "Сонгинохайрхан Сургууль",       plan: "Basic",      status: "inactive", adminEmail: "admin@songinoh.edu.mn", counselorCount: 2,  studentCount: 45,  storageUsed: "0.4 GB", startDate: "2025-06-01", endDate: "2026-01-31" },
  ])

  return NextResponse.json({
    ok: true,
    message: "Seed амжилттай. Нэвтрэх мэдээлэл:",
    credentials: [
      { role: "student",    email: "student@educounsel.mn",    password: "student123"    },
      { role: "counselor",  email: "counselor@educounsel.mn",  password: "counselor123"  },
      { role: "teacher",    email: "teacher@educounsel.mn",    password: "teacher123"    },
      { role: "admin",      email: "admin@educounsel.mn",      password: "admin123"      },
      { role: "super-admin",email: "superadmin@educounsel.mn", password: "superadmin123" },
    ],
  })
}
