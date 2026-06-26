import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { recurring, wallets, categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [rec] = await db
      .select({
        id: recurring.id,
        amount: recurring.amount,
        type: recurring.type,
        description: recurring.description,
        frequency: recurring.frequency,
        nextDate: recurring.nextDate,
        endDate: recurring.endDate,
        active: recurring.active,
        walletId: recurring.walletId,
        walletName: wallets.name,
        categoryId: recurring.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(recurring)
      .leftJoin(wallets, eq(recurring.walletId, wallets.id))
      .leftJoin(categories, eq(recurring.categoryId, categories.id))
      .where(and(eq(recurring.id, Number(id)), eq(recurring.userId, userId)))

    if (!rec) return NextResponse.json({ error: "Transaksi berulang tidak ditemukan" }, { status: 404 })
    return NextResponse.json(rec)
  } catch (e) {
    console.error("[Recurring] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(recurring).where(and(eq(recurring.id, Number(id)), eq(recurring.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Transaksi berulang tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { walletId, categoryId, amount, type, description, frequency, nextDate, endDate, active } = body

    if (type && type !== "income" && type !== "expense") return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 })
    if (frequency && !["daily", "weekly", "monthly", "yearly"].includes(frequency)) return NextResponse.json({ error: "Frekuensi tidak valid" }, { status: 400 })

    await db.update(recurring).set({
      walletId: walletId ? Number(walletId) : existing.walletId,
      categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existing.categoryId,
      amount: amount ? String(amount) : existing.amount,
      type: type || existing.type,
      description: description !== undefined ? description : existing.description,
      frequency: frequency || existing.frequency,
      nextDate: nextDate ? new Date(nextDate) : existing.nextDate,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
      active: active !== undefined ? active : existing.active,
    }).where(eq(recurring.id, Number(id)))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Recurring] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(recurring).where(and(eq(recurring.id, Number(id)), eq(recurring.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Transaksi berulang tidak ditemukan" }, { status: 404 })

    await db.delete(recurring).where(eq(recurring.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Recurring] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
