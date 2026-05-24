import { SignJWT, jwtVerify } from "jose"

export interface JWTPayload {
  userId: string
  role: string
  name: string
  email: string
}

let _secret: Uint8Array | null = null
function getSecret() {
  if (_secret) return _secret
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET environment variable is not defined")
  _secret = new TextEncoder().encode(secret)
  return _secret
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
