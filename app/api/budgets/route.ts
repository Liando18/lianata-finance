import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { budgets, categories } from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const period = searchParams.get("period")

    const conditions = [eq(budgets.userId, userId)]
    if (year) conditions.push(eq(budgets.year, Number(year)))
    if (month) conditions.push(eq(budgets.month, Number(month)))
    if (period && ["monthly", "yearly"].includes(period)) conditions.push(eq(budgets.period, period as "monthly" | "yearly"))

    const data = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
        period: budgets.period,
        month: budgets.month,
        year: budgets.year,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(budgets.year), desc(budgets.month))

    return NextResponse.json(data)
  } catch (e) {
    console.error("[Budgets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { categoryId, amount, period, month, year } = body

    if (!amount || !period || !year) return NextResponse.json({ error: "Jumlah, periode, dan tahun wajib diisi" }, { status: 400 })
    if (!["monthly", "yearly"].includes(period)) return NextResponse.json({ error: "Periode tidak valid" }, { status: 400 })

    const [budget] = await db
      .insert(budgets)
      .values({
        userId,
        categoryId: categoryId ? Number(categoryId) : null,
        amount: String(amount),
        period,
        month: period === "monthly" ? (month ? Number(month) : new Date().getMonth() + 1) : null,
        year: Number(year),
      })
      .returning({ id: budgets.id })

    return NextResponse.json({ success: true, id: budget.id }, { status: 201 })
  } catch (e) {
    console.error("[Budgets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
