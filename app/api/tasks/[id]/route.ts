import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Task } from "@/lib/models/Task"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

// GET /api/tasks/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  await connectDB()

  const task = await Task.findById(id)
  if (!task) return NextResponse.json({ error: "Даалгавар олдсонгүй" }, { status: 404 })

  return NextResponse.json({ task: task.toJSON() })
}

// PATCH /api/tasks/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowedFields = ["title", "description", "status", "priority", "deadline", "progress", "notes", "category"]
  const update: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) update[key] = body[key]
  }
  if (update.deadline) update.deadline = new Date(update.deadline as string)

  await connectDB()

  const task = await Task.findByIdAndUpdate(id, update, { new: true })
  if (!task) return NextResponse.json({ error: "Даалгавар олдсонгүй" }, { status: 404 })

  return NextResponse.json({ task: task.toJSON() })
}

// DELETE /api/tasks/:id  (counselor/admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 })
  if (payload.role !== "counselor" && payload.role !== "admin") {
    return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 })
  }

  const { id } = await params
  await connectDB()

  await Task.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
