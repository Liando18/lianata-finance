import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { wallets } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [wallet] = await db.select().from(wallets).where(and(eq(wallets.id, Number(id)), eq(wallets.userId, userId)))
    if (!wallet) return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 })

    return NextResponse.json(wallet)
  } catch (e) {
    console.error("[Wallets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(wallets).where(and(eq(wallets.id, Number(id)), eq(wallets.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { name, type, balance, color } = body

    if (!name?.trim()) return NextResponse.json({ error: "Nama dompet wajib diisi" }, { status: 400 })
    if (type && !["cash", "bank", "ewallet"].includes(type)) return NextResponse.json({ error: "Tipe dompet tidak valid" }, { status: 400 })

    await db.update(wallets).set({
      name: name.trim(),
      type: type || existing.type,
      balance: balance !== undefined ? String(balance) : existing.balance,
      color: color ?? existing.color,
    }).where(eq(wallets.id, Number(id)))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Wallets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(wallets).where(and(eq(wallets.id, Number(id)), eq(wallets.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 })

    await db.delete(wallets).where(eq(wallets.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Wallets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
