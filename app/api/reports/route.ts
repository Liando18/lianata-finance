import { NextRequest, NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { transactions, categories } from "@/lib/db/schema"
import { eq, and, gte, lt, desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const legacyUserId = await getLegacyUserId()
    if (!legacyUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "monthly"
    const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10)

    const date = new Date(dateStr)
    let startDate: Date
    let endDate: Date

    if (period === "daily") {
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
    } else if (period === "yearly") {
      startDate = new Date(date.getFullYear(), 0, 1)
      endDate = new Date(date.getFullYear() + 1, 0, 1)
    } else {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    }

    const allRows = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        date: transactions.date,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(
        eq(transactions.userId, legacyUserId),
        gte(transactions.date, startDate),
        lt(transactions.date, endDate),
      ))
      .orderBy(desc(transactions.date))

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      count: allRows.length,
    }
    for (const r of allRows) {
      const amt = Number(r.amount)
      if (r.type === "income") summary.totalIncome += amt
      else summary.totalExpense += amt
    }

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary,
      transactions: allRows,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
