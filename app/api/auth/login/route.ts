import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { signToken } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "И-мэйл болон нууц үгээ оруулна уу" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
    if (!user) {
      return NextResponse.json({ error: "Бүртгэлтэй и-мэйл хаяг олдсонгүй" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Нууц үг буруу байна" }, { status: 401 })
    }

    if (user.status === "inactive") {
      return NextResponse.json({ error: "Таны бүртгэл идэвхгүй байна" }, { status: 403 })
    }

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    })

    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade,
        school: user.school,
      },
    })

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return res
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Серверийн алдаа гарлаа" }, { status: 500 })
  }
}
