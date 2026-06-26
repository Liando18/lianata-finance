import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { wallets } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await db.select().from(wallets).where(eq(wallets.userId, userId)).orderBy(wallets.name)
    return NextResponse.json(data)
  } catch (e) {
    console.error("[Wallets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, type, balance, color } = body

    if (!name?.trim()) return NextResponse.json({ error: "Nama dompet wajib diisi" }, { status: 400 })
    if (!["cash", "bank", "ewallet"].includes(type)) return NextResponse.json({ error: "Tipe dompet tidak valid" }, { status: 400 })

    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        name: name.trim(),
        type,
        balance: String(balance || 0),
        color: color || null,
      })
      .returning({ id: wallets.id, name: wallets.name })

    return NextResponse.json({ success: true, id: wallet.id, name: wallet.name }, { status: 201 })
  } catch (e) {
    console.error("[Wallets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
