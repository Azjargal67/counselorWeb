import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  await connectDB()
  const user = await User.findById(payload.userId).select("emailReminders reminderDays email name").lean()
  if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })

  return NextResponse.json({
    emailReminders: (user as { emailReminders?: boolean }).emailReminders ?? false,
    reminderDays: (user as { reminderDays?: number }).reminderDays ?? 3,
    email: user.email,
    name: user.name,
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  const body = await req.json()
  const allowed = ["emailReminders", "reminderDays"]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await connectDB()
  await User.findByIdAndUpdate(payload.userId, update)
  return NextResponse.json({ ok: true })
}
