import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { RecommendationRequest } from "@/lib/models/RecommendationRequest"

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
