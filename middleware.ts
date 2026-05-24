import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

const PROTECTED = ["/student", "/counselor", "/teacher", "/admin", "/super-admin"]
const PLATFORM_LOGIN = "/platform/login"

const ROLE_HOME: Record<string, string> = {
  student:      "/student/home",
  counselor:    "/counselor/home",
  teacher:      "/teacher/home",
  admin:        "/admin/dashboard",
  "super-admin":"/super-admin/overview",
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("token")?.value

  // Verify once, reuse result
  const payload = token ? await verifyToken(token) : null

  if (pathname === PLATFORM_LOGIN) {
    if (payload?.role === "super-admin") {
      return NextResponse.redirect(new URL("/super-admin/overview", req.url))
    }
    return NextResponse.next()
  }

  if (pathname === "/login") {
    if (payload) {
      return NextResponse.redirect(new URL(ROLE_HOME[payload.role] ?? "/", req.url))
    }
    return NextResponse.next()
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (!token || !payload) {
    const loginUrl = pathname.startsWith("/super-admin") ? PLATFORM_LOGIN : "/login"
    const res = NextResponse.redirect(new URL(loginUrl, req.url))
    if (token) res.cookies.set("token", "", { maxAge: 0, path: "/" })
    return res
  }

  if (pathname.startsWith("/super-admin") && payload.role !== "super-admin") {
    return NextResponse.redirect(new URL(ROLE_HOME[payload.role] ?? "/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
