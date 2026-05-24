import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { AdmissionResult } from "@/lib/models/AdmissionResult"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// PUT /api/admissions/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  await connectDB()
  const doc = await AdmissionResult.findById(id)
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 })

  if (payload.role === "student" && doc.studentId.toString() !== payload.userId) {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const body = await req.json()
  const fields = ["schoolName", "country", "status", "scholarshipPercent", "scholarshipAmount", "currency", "major", "notes", "resultDate"]
  for (const f of fields) {
    if (body[f] !== undefined) doc.set(f, body[f])
  }
  await doc.save()

  return NextResponse.json({ admission: doc.toJSON() })
}

// DELETE /api/admissions/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  await connectDB()
  const doc = await AdmissionResult.findById(id)
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 })

  if (payload.role === "student" && doc.studentId.toString() !== payload.userId) {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  await doc.deleteOne()
  return NextResponse.json({ success: true })
}
