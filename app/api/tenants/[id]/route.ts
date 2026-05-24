import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Tenant } from "@/lib/models/Tenant"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/tenants/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { id } = await params
  await connectDB()
  const tenant = await Tenant.findById(id).lean()
  if (!tenant) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 })

  return NextResponse.json({
    tenant: { ...(tenant as any), id: (tenant as any)._id.toString(), _id: undefined, __v: undefined },
  })
}

// PUT /api/tenants/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { id } = await params
  await connectDB()
  const doc = await Tenant.findById(id)
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 })

  const body = await req.json()
  const fields = ["name", "plan", "status", "adminEmail", "counselorCount", "studentCount", "storageUsed", "startDate", "endDate"]
  for (const f of fields) {
    if (body[f] !== undefined) doc.set(f, body[f])
  }
  await doc.save()
  return NextResponse.json({ tenant: doc.toJSON() })
}

// DELETE /api/tenants/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { id } = await params
  await connectDB()
  const doc = await Tenant.findByIdAndDelete(id)
  if (!doc) return NextResponse.json({ error: "Олдсонгүй" }, { status: 404 })
  return NextResponse.json({ success: true })
}
