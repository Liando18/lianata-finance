import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verification } from "@/lib/db/schema"
import { sendOtpEmail } from "@/lib/email"
import { eq } from "drizzle-orm"
import { logAction } from "@/lib/log/activity-log"

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await db.delete(verification).where(eq(verification.identifier, `otp:${email}`)).catch(() => {})

    await db.insert(verification).values({
      identifier: `otp:${email}`,
      value: otp,
      expiresAt,
      id: makeId(),
    })

    await sendOtpEmail(email, otp)

    logAction("send_otp", "auth", { details: `Email: ${email}`, headers: req.headers })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[OTP] Error:", e)
    return NextResponse.json({ error: "Gagal mengirim kode" }, { status: 500 })
  }
}
