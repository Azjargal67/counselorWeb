import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { RecommendationRequest } from "@/lib/models/RecommendationRequest"
import { Notification } from "@/lib/models/Notification"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/recommendations
// teacher → their requests; student → requests they made
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get("status")

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (payload.role === "teacher") filter.teacherId = payload.userId
  else if (payload.role === "student") filter.studentId = payload.userId
  if (statusFilter && statusFilter !== "all") filter.status = statusFilter

  const requests = await RecommendationRequest.find(filter).sort({ createdAt: -1 })
  return NextResponse.json({ requests: requests.map(r => r.toJSON()) })
}

// POST /api/recommendations  (student creates request)
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const body = await req.json()
  const { studentName, teacherId, teacherName, school, deadline, message } = body

  if (!teacherId || !school || !deadline) {
    return NextResponse.json({ error: "Заавал талбарууд дутуу байна" }, { status: 400 })
  }

  await connectDB()
  const request = await RecommendationRequest.create({
    studentId: payload.userId,
    studentName: studentName ?? payload.name,
    teacherId,
    teacherName,
    school,
    deadline: new Date(deadline),
    message,
  })

  await Notification.create({
    userId: teacherId,
    type: "recommendation",
    title: "Шинэ recommendation хүсэлт",
    message: `${studentName ?? payload.name} сурагч "${school}" сургуульд зориулж хүсэлт илгээлээ.`,
    link: "/teacher/requests",
  })

  return NextResponse.json({ request: request.toJSON() }, { status: 201 })
}
