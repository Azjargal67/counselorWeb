import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Document } from "@/lib/models/Document"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/documents
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentIdParam = searchParams.get("studentId")

  await connectDB()

  const filter: Record<string, unknown> = {}
  if (payload.role === "student") filter.studentId = payload.userId
  else if (studentIdParam) filter.studentId = studentIdParam

  const docs = await Document.find(filter).sort({ createdAt: -1 })
  return NextResponse.json({ documents: docs.map(d => d.toJSON()) })
}

// POST /api/documents
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const body = await req.json()
  const { name, type, size, category, version, url } = body

  if (!name || !type) {
    return NextResponse.json({ error: "Нэр болон төрөл шаардлагатай" }, { status: 400 })
  }

  await connectDB()
  const doc = await Document.create({
    name, type, size, category, version, url,
    studentId: payload.userId,
  })
  return NextResponse.json({ document: doc.toJSON() }, { status: 201 })
}
