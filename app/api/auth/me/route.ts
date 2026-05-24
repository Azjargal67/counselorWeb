import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { Tenant } from "@/lib/models/Tenant"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Token хүчингүй байна" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(payload.userId)
  if (!user) {
    return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 })
  }

  const userData = user.toJSON()

  // For admin users, attach their school's tenant name
  if (user.role === "admin") {
    const tenant = await Tenant.findOne({ adminEmail: user.email }).lean() as { name?: string } | null
    if (tenant?.name) {
      userData.tenantName = tenant.name
    }
  }

  return NextResponse.json({ user: userData })
}
