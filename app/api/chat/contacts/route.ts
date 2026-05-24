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

  let roles: string[] = []
  if (payload.role === "student") roles = ["counselor", "teacher"]
  else if (payload.role === "counselor") roles = ["student", "teacher"]
  else if (payload.role === "teacher") roles = ["student", "counselor"]
  else roles = ["student", "counselor", "teacher"]

  const contacts = await User.find({
    role: { $in: roles },
    _id: { $ne: payload.userId },
    status: "active",
  }).select("name role grade").lean()

  return NextResponse.json({
    contacts: contacts.map(c => ({
      id: (c._id as { toString(): string }).toString(),
      name: c.name,
      role: c.role,
      grade: c.grade,
    }))
  })
}
