const ipRequests = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipRequests.get(ip)
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + 10_000 })
    return true
  }
  entry.count++
  return entry.count <= 10
}

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!rateLimit(ip)) {
    return Response.json({ error: "Terlalu banyak permintaan" }, { status: 429 })
  }

  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email diperlukan" }, { status: 400 })
    }

    const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email.toLowerCase())).limit(1)
    const available = existing.length === 0

    return Response.json({ available })
  } catch {
    return Response.json({ error: "Gagal memeriksa email" }, { status: 500 })
  }
}
