import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyToken } from "@/lib/jwt"
import { connectDB } from "@/lib/db"
import { Document } from "@/lib/models/Document"

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

function getDocType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  if (["pdf"].includes(ext)) return "essay"
  if (["doc", "docx"].includes(ext)) return "cv"
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "other"
  return "other"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function POST(req: NextRequest) {
  const payload = await getPayload(req)
  if (!payload) return NextResponse.json({ error: "Нэвтрээгүй" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const category = (formData.get("category") as string) || "Бусад"

  if (!file) return NextResponse.json({ error: "Файл сонгоно уу" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Файл 10MB-аас хэтрэхгүй байх ёстой" }, { status: 400 })

  const filename = `${payload.userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  const blob = await put(filename, file, { access: "public" })

  const typeMap: Record<string, string> = {
    Essay: "essay", CV: "cv", Transcript: "transcript",
    Recommendation: "recommendation", Бусад: "other",
  }

  await connectDB()
  const doc = await Document.create({
    name: file.name,
    type: typeMap[category] ?? getDocType(file.name),
    size: formatSize(file.size),
    category,
    version: "v1",
    url: blob.url,
    studentId: payload.userId,
  })

  return NextResponse.json({ document: doc.toJSON() }, { status: 201 })
}
