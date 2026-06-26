import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { transactions, wallets, categories } from "@/lib/db/schema"
import { eq, and, desc, sql, like } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const q = searchParams.get("q")
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20))
    const offset = (page - 1) * limit

    const conditions = [eq(transactions.userId, userId)]
    if (type && (type === "income" || type === "expense")) conditions.push(eq(transactions.type, type))
    if (q) conditions.push(like(sql`LOWER(${transactions.description})`, `%${q.toLowerCase()}%`))

    const [countResult] = await db
      .select({ value: sql`COUNT(*)` })
      .from(transactions)
      .where(and(...conditions))

    const total = Number(countResult.value) || 0

    const data = await db
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
      .where(and(...conditions))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (e) {
    console.error("[Transactions] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { walletId, categoryId, amount, type, description, date } = body

    if (!walletId || !amount || !type || !date) {
      return NextResponse.json({ error: "Dompet, jumlah, tipe, dan tanggal wajib diisi" }, { status: 400 })
    }
    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ error: "Tipe harus income atau expense" }, { status: 400 })
    }

    const [tx] = await db
      .insert(transactions)
      .values({
        userId,
        walletId: Number(walletId),
        categoryId: categoryId ? Number(categoryId) : null,
        amount: String(amount),
        type,
        description: description || null,
        date: new Date(date),
      })
      .returning({ id: transactions.id })

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

    return NextResponse.json({ success: true, id: tx.id }, { status: 201 })
  } catch (e) {
    console.error("[Transactions] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
