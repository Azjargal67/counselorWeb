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

// GET /api/users  (admin/counselor)
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role")

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (role) filter.role = role

  if (payload.role === "counselor") filter.role = "student"
  if (payload.role === "student") filter.role = "teacher"

  if (payload.role === "admin") {
    const adminUser = await User.findById(payload.userId)
    if (adminUser?.school) filter.school = adminUser.school
  }

  const users = await User.find(filter).sort({ createdAt: -1 })
  return NextResponse.json({ users: users.map((u) => u.toJSON()) })
}

// POST /api/users  (admin only - create new user)
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "admin" && payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { name, email, password, role, grade } = await req.json()

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Заавал талбарууд дутуу байна" }, { status: 400 })
  }

  await connectDB()

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: "Энэ и-мэйл бүртгэлтэй байна" }, { status: 409 })
  }

  // admin-ийн сургуулийг шинэ хэрэглэгчид автоматаар оноо
  const adminUser = await User.findById(payload.userId)
  const school = adminUser?.school ?? ""

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, password: hashed, role, grade, school })

  return NextResponse.json({ user: user.toJSON() }, { status: 201 })
}
