import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verification } from "@/lib/db/schema"
import { eq, and, gte } from "drizzle-orm"
import { logAction } from "@/lib/log/activity-log"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) {
      return NextResponse.json({ error: "Email dan kode wajib diisi" }, { status: 400 })
    }

    const [row] = await db
      .select()
      .from(verification)
      .where(and(
        eq(verification.identifier, `otp:${email}`),
        eq(verification.value, otp),
        gte(verification.expiresAt, new Date()),
      ))
      .limit(1)

    if (!row) {
      return NextResponse.json({ error: "Kode tidak valid atau sudah kedaluwarsa" }, { status: 400 })
    }

    await db.delete(verification).where(eq(verification.id, row.id))

    logAction("verify_otp", "auth", { details: `Email: ${email}`, headers: req.headers })

    return NextResponse.json({ success: true, email })
  } catch (e) {
    return NextResponse.json({ error: "Gagal memverifikasi kode" }, { status: 500 })
  }
}
