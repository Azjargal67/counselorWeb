import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Notification } from "@/lib/models/Notification"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  await connectDB()

  const notifications = await Notification.find({ userId: payload.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const unread = await Notification.countDocuments({ userId: payload.userId, read: false })

  return NextResponse.json({
    notifications: notifications.map(n => ({
      id: (n._id as { toString(): string }).toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt,
    })),
    unread,
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  await connectDB()
  await Notification.updateMany({ userId: payload.userId, read: false }, { read: true })

  return NextResponse.json({ ok: true })
}
