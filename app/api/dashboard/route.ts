import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import {
  users, transactions, wallets, categories,
  user as authUserTable, session as sessionTable, debts,
} from "@/lib/db/schema"
import { eq, and, gte, lte, desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role === "admin" || session.user.role === "owner" ? session.user.role : "user"

  const [legacyUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1)
  const legacyUserId = legacyUser?.id

  const result: Record<string, unknown> = { role }

  if (role === "user" && legacyUserId) {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const [balance] = await db
      .select({ value: sql`COALESCE(SUM(CAST(${wallets.balance} AS numeric)), 0)` })
      .from(wallets)
      .where(eq(wallets.userId, legacyUserId))

    const [income] = await db
      .select({ value: sql`COALESCE(SUM(CAST(${transactions.amount} AS numeric)), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, legacyUserId), eq(transactions.type, "income"), gte(transactions.date, firstDay)))

    const [expense] = await db
      .select({ value: sql`COALESCE(SUM(CAST(${transactions.amount} AS numeric)), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, legacyUserId), eq(transactions.type, "expense"), gte(transactions.date, firstDay)))

    const [txnCount] = await db
      .select({ value: sql`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.userId, legacyUserId))

    result.financial = {
      totalBalance: Number(balance.value) || 0,
      incomeThisMonth: Number(income.value) || 0,
      expenseThisMonth: Number(expense.value) || 0,
      totalTransactions: Number(txnCount.value) || 0,
    }

    const chartRaw = await db
      .select({
        month: sql`to_char(${transactions.date}, 'MM')`,
        year: sql`to_char(${transactions.date}, 'YYYY')`,
        type: transactions.type,
        total: sql`SUM(CAST(${transactions.amount} AS numeric))`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, legacyUserId),
        gte(transactions.date, new Date(now.getFullYear() - 1, now.getMonth(), 1)),
      ))
      .groupBy(sql`to_char(${transactions.date}, 'MM')`, sql`to_char(${transactions.date}, 'YYYY')`, transactions.type)
      .orderBy(sql`to_char(${transactions.date}, 'YYYY')`, sql`to_char(${transactions.date}, 'MM')`)

    result.chart = chartRaw

    const recent = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        walletName: wallets.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(wallets, eq(transactions.walletId, wallets.id))
      .where(eq(transactions.userId, legacyUserId))
      .orderBy(desc(transactions.date))
      .limit(5)

    result.recentTransactions = recent

    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const [dueDebts] = await db
      .select({ value: sql`COUNT(*)` })
      .from(debts)
      .where(and(
        eq(debts.userId, legacyUserId),
        eq(debts.status, "active"),
        gte(debts.dueDate, now),
        lte(debts.dueDate, weekFromNow),
      ))

    result.badge = {
      text: `${Number(dueDebts.value) || 0} tagihan jatuh tempo`,
    }
  }

  if (role === "admin" || role === "owner") {
    const [totalUsers] = await db
      .select({ value: sql`COUNT(*)` })
      .from(authUserTable)

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const [activeUsers] = await db
      .select({ value: sql`COUNT(DISTINCT ${sessionTable.userId})` })
      .from(sessionTable)
      .where(gte(sessionTable.expiresAt, new Date()))

    let activityToday = 0
    try {
      const { getLogCollection } = await import("@/lib/log")
      const logs = getLogCollection("activity_logs")
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      activityToday = await logs.countDocuments({ createdAt: { $gte: todayStart } })
    } catch {
      activityToday = 0
    }

    result.admin = {
      activityToday,
      activeUsers: Number(activeUsers.value) || 0,
      totalUsers: Number(totalUsers.value) || 0,
    }

    result.badge = {
      text: role === "owner" ? "Pengawasan sistem aktif" : `${Number(activeUsers.value) || 0} pengguna aktif`,
    }
  }

  return NextResponse.json(result)
  } catch (e) {
    console.error("[Dashboard] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
