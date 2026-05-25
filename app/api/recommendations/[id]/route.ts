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

// PATCH /api/recommendations/:id  (teacher updates status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowed = ["status", "notes"]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await connectDB()
  const request = await RecommendationRequest.findByIdAndUpdate(id, update, { new: true })
  if (!request) return NextResponse.json({ error: "Хүсэлт олдсонгүй" }, { status: 404 })

  if (update.status) {
    const statusLabel: Record<string, string> = { writing: "бичигдэж байна", sent: "илгээгдлээ", rejected: "татгалзагдлаа" }
    const label = statusLabel[update.status as string]
    if (label) {
      await Notification.create({
        userId: request.studentId,
        type: "recommendation",
        title: "Recommendation шинэчлэгдлээ",
        message: `"${request.school}" сургуулийн recommendation ${label}.`,
        link: "/student/tasks",
      })
    }
  }

  return NextResponse.json({ request: request.toJSON() })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  await connectDB()
  await RecommendationRequest.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
