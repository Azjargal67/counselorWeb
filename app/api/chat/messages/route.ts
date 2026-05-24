import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Message } from "@/lib/models/Message"
import { Conversation } from "@/lib/models/Conversation"
import mongoose from "mongoose"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const convId = searchParams.get("convId")
  const after = searchParams.get("after")
  if (!convId) return NextResponse.json({ error: "convId шаардлагатай" }, { status: 400 })

  await connectDB()

  const conv = await Conversation.findOne({ _id: convId, participants: payload.userId })
  if (!conv) return NextResponse.json({ error: "Хандах эрхгүй" }, { status: 403 })

  const query: Record<string, unknown> = { conversationId: convId }
  if (after) query.createdAt = { $gt: new Date(after) }

  const messages = await Message.find(query).sort({ createdAt: 1 }).lean()

  await Message.updateMany(
    { conversationId: convId, senderId: { $ne: payload.userId }, read: false },
    { read: true }
  )

  return NextResponse.json({
    messages: messages.map(m => ({
      id: (m._id as { toString(): string }).toString(),
      senderId: (m.senderId as { toString(): string }).toString(),
      senderName: m.senderName,
      senderRole: m.senderRole,
      content: m.content,
      read: m.read,
      createdAt: m.createdAt,
    }))
  })
}

export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  const { convId, content } = await req.json()
  if (!convId || !content?.trim()) return NextResponse.json({ error: "Мэдээлэл дутуу" }, { status: 400 })

  await connectDB()

  const conv = await Conversation.findOne({ _id: convId, participants: payload.userId })
  if (!conv) return NextResponse.json({ error: "Хандах эрхгүй" }, { status: 403 })

  const message = await Message.create({
    conversationId: new mongoose.Types.ObjectId(convId),
    senderId: new mongoose.Types.ObjectId(payload.userId),
    senderName: payload.name,
    senderRole: payload.role,
    content: content.trim(),
    read: false,
  })

  await Conversation.findByIdAndUpdate(convId, {
    lastMessage: content.trim().slice(0, 100),
    lastMessageAt: new Date(),
  })

  return NextResponse.json({
    message: {
      id: (message._id as { toString(): string }).toString(),
      senderId: (message.senderId as { toString(): string }).toString(),
      senderName: message.senderName,
      senderRole: message.senderRole,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt,
    }
  }, { status: 201 })
}
