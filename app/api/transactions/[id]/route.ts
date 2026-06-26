import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { transactions, wallets, categories } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [tx] = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        date: transactions.date,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        walletId: transactions.walletId,
        walletName: wallets.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .where(and(eq(transactions.id, Number(id)), eq(transactions.userId, userId)))

    if (!tx) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    return NextResponse.json(tx)
  } catch (e) {
    console.error("[Transactions] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, Number(id)), eq(transactions.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { walletId, categoryId, amount, type, description, date } = body

    if (!walletId || !amount || !type || !date) {
      return NextResponse.json({ error: "Dompet, jumlah, tipe, dan tanggal wajib diisi" }, { status: 400 })
    }
    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ error: "Tipe harus income atau expense" }, { status: 400 })
    }

    await db
      .update(transactions)
      .set({
        walletId: Number(walletId),
        categoryId: categoryId ? Number(categoryId) : null,
        amount: String(amount),
        type,
        description: description || null,
        date: new Date(date),
      })
      .where(eq(transactions.id, Number(id)))

    if (existing.walletId !== Number(walletId) || existing.type !== type || existing.amount !== String(amount)) {
      if (existing.type === "expense") {
        await db
          .update(wallets)
          .set({ balance: sql`CAST(${wallets.balance} AS numeric) + ${existing.amount}` })
          .where(eq(wallets.id, existing.walletId))
      } else {
        await db
          .update(wallets)
          .set({ balance: sql`CAST(${wallets.balance} AS numeric) - ${existing.amount}` })
          .where(eq(wallets.id, existing.walletId))
      }

      if (type === "expense") {
        await db
          .update(wallets)
          .set({ balance: sql`CAST(${wallets.balance} AS numeric) - ${String(amount)}` })
          .where(eq(wallets.id, Number(walletId)))
      } else {
        await db
          .update(wallets)
          .set({ balance: sql`CAST(${wallets.balance} AS numeric) + ${String(amount)}` })
          .where(eq(wallets.id, Number(walletId)))
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Transactions] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, Number(id)), eq(transactions.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })

    await db.delete(transactions).where(eq(transactions.id, Number(id)))

    if (existing.type === "expense") {
      await db
        .update(wallets)
        .set({ balance: sql`CAST(${wallets.balance} AS numeric) + ${existing.amount}` })
        .where(eq(wallets.id, existing.walletId))
    } else {
      await db
        .update(wallets)
        .set({ balance: sql`CAST(${wallets.balance} AS numeric) - ${existing.amount}` })
        .where(eq(wallets.id, existing.walletId))
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Transactions] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
