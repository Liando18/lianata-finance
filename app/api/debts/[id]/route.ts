import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { debts } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [debt] = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, Number(id)), eq(debts.userId, userId)))

    if (!debt) return NextResponse.json({ error: "Hutang/piutang tidak ditemukan" }, { status: 404 })
    return NextResponse.json(debt)
  } catch (e) {
    console.error("[Debts] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(debts).where(and(eq(debts.id, Number(id)), eq(debts.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Hutang/piutang tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { name, amount, paidAmount, type, status, dueDate, description } = body

    if (type && !["debt", "receivable"].includes(type)) return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 })
    if (status && !["active", "partial", "paid"].includes(status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })

    await db.update(debts).set({
      name: name?.trim() || existing.name,
      amount: amount ? String(amount) : existing.amount,
      paidAmount: paidAmount !== undefined ? String(paidAmount) : existing.paidAmount,
      type: type || existing.type,
      status: status || existing.status,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
      description: description !== undefined ? description : existing.description,
    }).where(eq(debts.id, Number(id)))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Debts] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(debts).where(and(eq(debts.id, Number(id)), eq(debts.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Hutang/piutang tidak ditemukan" }, { status: 404 })

    await db.delete(debts).where(eq(debts.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Debts] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
