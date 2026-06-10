import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { AdmissionResult } from "@/lib/models/AdmissionResult"
import { User } from "@/lib/models/User"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/admissions
// Students: own results only
// Counselors/admins: all results with student info
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const studentIdParam = searchParams.get("studentId")

  await connectDB()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  if (payload.role === "student") {
    filter.studentId = payload.userId
  } else if (studentIdParam) {
    filter.studentId = studentIdParam
  }

  const results = await AdmissionResult.find(filter)
    .populate("studentId", "name grade")
    .sort({ resultDate: -1 })
    .lean()

  const normalized = results.map((r: any) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
    __v: undefined,
    studentId: r.studentId?._id?.toString() ?? r.studentId?.toString(),
    studentName: r.studentId?.name ?? undefined,
    studentGrade: r.studentId?.grade ?? undefined,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
    updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
  }))

  return NextResponse.json({ admissions: normalized })
}

// POST /api/admissions  (student creates own)
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const body = await req.json()
  const { schoolName, country, status, scholarshipPercent, scholarshipAmount, currency, major, notes, resultDate } = body

  if (!schoolName || !status) {
    return NextResponse.json({ error: "Заавал бөглөх талбарууд дутуу байна" }, { status: 400 })
  }

  await connectDB()

  const admission = await AdmissionResult.create({
    studentId: payload.userId,
    schoolName,
    country: country ?? "",
    status,
    scholarshipPercent: scholarshipPercent ?? 0,
    scholarshipAmount: scholarshipAmount ?? 0,
    currency: currency ?? "MNT",
    major: major ?? "",
    notes: notes ?? "",
    resultDate: resultDate ?? "",
  })

  return NextResponse.json({ admission: admission.toJSON() }, { status: 201 })
}
