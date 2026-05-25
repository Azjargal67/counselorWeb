import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Task } from "@/lib/models/Task"
import { Notification } from "@/lib/models/Notification"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/tasks
// Supports: ?studentId=, ?status=, ?counselorId=
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const statusFilter   = searchParams.get("status")
  const studentIdParam = searchParams.get("studentId")

  await connectDB()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  if (payload.role === "student") {
    filter.studentId = payload.userId
  } else {
    filter.counselorId = payload.userId
  }

  if (studentIdParam) filter.studentId = studentIdParam
  if (statusFilter && statusFilter !== "all") filter.status = statusFilter

  const tasks = await Task.find(filter)
    .populate("studentId", "name email grade")
    .populate("counselorId", "name email")
    .sort({ deadline: 1 })
    .lean()

  // Normalize: flatten populated sub-documents and stringify ids
  const normalized = tasks.map((t: any) => ({
    ...t,
    id: t._id.toString(),
    _id: undefined,
    __v: undefined,
    studentId: t.studentId?._id?.toString() ?? t.studentId?.toString(),
    counselorId: t.counselorId?._id?.toString() ?? t.counselorId?.toString(),
    studentName: t.studentId?.name ?? undefined,
    studentGrade: t.studentId?.grade ?? undefined,
    deadline: t.deadline?.toISOString?.() ?? t.deadline,
    createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    updatedAt: t.updatedAt?.toISOString?.() ?? t.updatedAt,
  }))

  return NextResponse.json({ tasks: normalized })
}

// POST /api/tasks  (counselor only)
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "counselor" && payload.role !== "admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, category, deadline, priority, studentId, notes } = body

  if (!title || !category || !deadline || !studentId) {
    return NextResponse.json({ error: "Заавал талбарууд дутуу байна" }, { status: 400 })
  }

  await connectDB()

  const task = await Task.create({
    title,
    description,
    category,
    deadline: new Date(deadline),
    priority: priority ?? "medium",
    studentId,
    counselorId: payload.userId,
    notes,
  })

  await Notification.create({
    userId: studentId,
    type: "task",
    title: "Шинэ даалгавар нэмэгдлээ",
    message: `"${title}" даалгавар таньд өгөгдлөө.`,
    link: "/student/tasks",
  })

  return NextResponse.json({ task: task.toJSON() }, { status: 201 })
}
