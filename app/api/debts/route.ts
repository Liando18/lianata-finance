import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { debts } from "@/lib/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const conditions = [eq(debts.userId, userId)]
    if (type && ["debt", "receivable"].includes(type)) conditions.push(eq(debts.type, type as "debt" | "receivable"))
    if (status && ["active", "partial", "paid"].includes(status)) conditions.push(eq(debts.status, status as "active" | "partial" | "paid"))

    const data = await db
      .select({
        id: debts.id,
        name: debts.name,
        amount: debts.amount,
        paidAmount: debts.paidAmount,
        type: debts.type,
        status: debts.status,
        dueDate: debts.dueDate,
        description: debts.description,
        createdAt: debts.createdAt,
      })
      .from(debts)
      .where(and(...conditions))
      .orderBy(desc(debts.createdAt))

    const totalDebt = data.filter(d => d.type === "debt").reduce((s, d) => s + Number(d.amount) - Number(d.paidAmount), 0)
    const totalReceivable = data.filter(d => d.type === "receivable").reduce((s, d) => s + Number(d.amount) - Number(d.paidAmount), 0)

    return NextResponse.json({ data, summary: { totalDebt, totalReceivable } })
  } catch (e) {
    console.error("[Debts] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, amount, type, dueDate, description } = body

    if (!name?.trim() || !amount || !type) return NextResponse.json({ error: "Nama, jumlah, dan tipe wajib diisi" }, { status: 400 })
    if (!["debt", "receivable"].includes(type)) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 })

    const [debt] = await db
      .insert(debts)
      .values({
        userId,
        name: name.trim(),
        amount: String(amount),
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        description: description || null,
      })
      .returning({ id: debts.id })

    return NextResponse.json({ success: true, id: debt.id }, { status: 201 })
  } catch (e) {
    console.error("[Debts] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
