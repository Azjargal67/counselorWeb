import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/users/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  await connectDB()

  const user = await User.findById(id)
  if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })

  return NextResponse.json({ user: user.toJSON() })
}

// PATCH /api/users/:id  (self or admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params

  // user can only edit themselves unless admin
  if (payload.userId !== id && payload.role !== "admin" && payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const body = await req.json()
  const allowedFields = ["name", "grade", "school", "phone", "status", "academicHistory"]
  const update: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) update[key] = body[key]
  }

  if (body.password) {
    update.password = await bcrypt.hash(body.password, 12)
  }

  await connectDB()

  const user = await User.findByIdAndUpdate(id, update, { new: true })
  if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })

  return NextResponse.json({ user: user.toJSON() })
}

// DELETE /api/users/:id  (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "admin" && payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  await User.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
