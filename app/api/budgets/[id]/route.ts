import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { budgets, categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [budget] = await db
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
      .where(and(eq(budgets.id, Number(id)), eq(budgets.userId, userId)))

    if (!budget) return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 })
    return NextResponse.json(budget)
  } catch (e) {
    console.error("[Budgets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(budgets).where(and(eq(budgets.id, Number(id)), eq(budgets.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { categoryId, amount, period, month, year } = body

    if (period && !["monthly", "yearly"].includes(period)) return NextResponse.json({ error: "Periode tidak valid" }, { status: 400 })

    await db.update(budgets).set({
      categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existing.categoryId,
      amount: amount ? String(amount) : existing.amount,
      period: period || existing.period,
      month: period === "yearly" ? null : (month !== undefined ? Number(month) : existing.month),
      year: year ? Number(year) : existing.year,
    }).where(eq(budgets.id, Number(id)))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Budgets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(budgets).where(and(eq(budgets.id, Number(id)), eq(budgets.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 })

    await db.delete(budgets).where(eq(budgets.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Budgets] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
