import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Tenant } from "@/lib/models/Tenant"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/tenants
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  await connectDB()
  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean()

  const normalized = tenants.map((t: any) => ({
    ...t,
    id: t._id.toString(),
    _id: undefined,
    __v: undefined,
    createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    updatedAt: t.updatedAt?.toISOString?.() ?? t.updatedAt,
  }))

  return NextResponse.json({ tenants: normalized })
}

// POST /api/tenants
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "super-admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const body = await req.json()
  const { name, plan, adminEmail, startDate, endDate } = body

  if (!name || !plan) {
    return NextResponse.json({ error: "Нэр болон тарифыг оруулна уу" }, { status: 400 })
  }

  await connectDB()
  const tenant = await Tenant.create({ name, plan, adminEmail, startDate, endDate, status: "pending_payment" })
  return NextResponse.json({ tenant: tenant.toJSON() }, { status: 201 })
}
