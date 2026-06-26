import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { recurring, wallets, categories } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await db
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
      .where(eq(recurring.userId, userId))
      .orderBy(desc(recurring.nextDate))

    return NextResponse.json(data)
  } catch (e) {
    console.error("[Recurring] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { walletId, categoryId, amount, type, description, frequency, nextDate, endDate } = body

    if (!walletId || !amount || !type || !frequency || !nextDate) {
      return NextResponse.json({ error: "Dompet, jumlah, tipe, frekuensi, dan tanggal berikutnya wajib diisi" }, { status: 400 })
    }
    if (type !== "income" && type !== "expense") return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 })
    if (!["daily", "weekly", "monthly", "yearly"].includes(frequency)) return NextResponse.json({ error: "Frekuensi tidak valid" }, { status: 400 })

    const [rec] = await db
      .insert(recurring)
      .values({
        userId,
        walletId: Number(walletId),
        categoryId: categoryId ? Number(categoryId) : null,
        amount: String(amount),
        type,
        description: description || null,
        frequency,
        nextDate: new Date(nextDate),
        endDate: endDate ? new Date(endDate) : null,
      })
      .returning({ id: recurring.id })

    return NextResponse.json({ success: true, id: rec.id }, { status: 201 })
  } catch (e) {
    console.error("[Recurring] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
