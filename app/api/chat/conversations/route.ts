import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Conversation } from "@/lib/models/Conversation"
import { Message } from "@/lib/models/Message"
import mongoose from "mongoose"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  await connectDB()

  const convs = await Conversation.find({ participants: payload.userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name role grade")
    .lean()

  const result = await Promise.all(convs.map(async conv => {
    const unread = await Message.countDocuments({
      conversationId: conv._id,
      senderId: { $ne: payload.userId },
      read: false,
    })
    const other = (conv.participants as { _id: { toString(): string }; name: string; role: string; grade?: string }[])
      .find(p => p._id.toString() !== payload.userId)
    return {
      id: (conv._id as { toString(): string }).toString(),
      otherId: other?._id?.toString(),
      otherName: other?.name,
      otherRole: other?.role,
      otherGrade: other?.grade,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unread,
    }
  }))

  return NextResponse.json({ conversations: result })
}

export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId шаардлагатай" }, { status: 400 })

  await connectDB()

  const myId = new mongoose.Types.ObjectId(payload.userId)
  const otherId = new mongoose.Types.ObjectId(userId)

  let conv = await Conversation.findOne({
    participants: { $all: [myId, otherId], $size: 2 },
  })

  if (!conv) {
    conv = await Conversation.create({
      participants: [myId, otherId],
      lastMessage: "",
      lastMessageAt: new Date(),
    })
  }

  return NextResponse.json({ conversationId: (conv._id as { toString(): string }).toString() })
}
