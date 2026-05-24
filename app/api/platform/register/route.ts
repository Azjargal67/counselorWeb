import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Tenant } from "@/lib/models/Tenant"
import { User } from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { schoolName, plan, adminName, adminEmail, adminPassword } = await req.json()

  if (!schoolName || !plan || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 })
  }

  await connectDB()

  const existing = await User.findOne({ email: adminEmail.trim().toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: "Энэ и-мэйл бүртгэлтэй байна" }, { status: 409 })
  }

  const tenant = await Tenant.create({
    name: schoolName,
    plan,
    adminEmail: adminEmail.trim().toLowerCase(),
    status: "pending_payment",
  })

  const hashed = await bcrypt.hash(adminPassword, 10)
  await User.create({
    name: adminName,
    email: adminEmail.trim().toLowerCase(),
    password: hashed,
    role: "admin",
    school: schoolName,
  })

  return NextResponse.json({ tenantId: tenant._id.toString() }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { tenantId } = await req.json()
  if (!tenantId) return NextResponse.json({ error: "tenantId шаардлагатай" }, { status: 400 })

  await connectDB()
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { status: "active", startDate: new Date().toISOString().slice(0, 10) },
    { new: true }
  )
  if (!tenant) return NextResponse.json({ error: "Tenant олдсонгүй" }, { status: 404 })

  return NextResponse.json({ success: true })
}
