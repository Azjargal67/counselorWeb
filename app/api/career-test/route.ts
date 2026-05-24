import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { CareerTestResult } from "@/lib/models/CareerTestResult"
import { Task } from "@/lib/models/Task"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/career-test — check if current student completed the test
export async function GET(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  await connectDB()
  const result = await CareerTestResult.findOne({ studentId: payload.userId }).lean()
  if (!result) return NextResponse.json({ completed: false })

  return NextResponse.json({ completed: true, result })
}

// POST /api/career-test — save test result
export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "student") {
    return NextResponse.json({ error: "Зөвхөн сурагч хандах боломжтой" }, { status: 403 })
  }

  const body = await req.json()
  const { hollandCode, scores } = body

  if (!hollandCode || !scores) {
    return NextResponse.json({ error: "Мэдээлэл дутуу байна" }, { status: 400 })
  }

  await connectDB()

  const result = await CareerTestResult.findOneAndUpdate(
    { studentId: payload.userId },
    { hollandCode, scores, completedAt: new Date() },
    { upsert: true, new: true }
  )

  // Mark the career-test task as done (match by category or title for backwards compat)
  await Task.findOneAndUpdate(
    { studentId: payload.userId, $or: [{ category: "career-test" }, { title: "Мэргэжил сонголтын тест" }] },
    { status: "done", progress: 100 }
  )

  return NextResponse.json({ result: result.toJSON() }, { status: 201 })
}
