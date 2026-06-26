import { NextRequest, NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { debts } from "@/lib/db/schema"
import { eq, and, lte } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const legacyUserId = await getLegacyUserId()
    if (!legacyUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") || "10")

    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const dueDebts = await db
      .select({ id: debts.id, dueDate: debts.dueDate, name: debts.name, amount: debts.amount, type: debts.type })
      .from(debts)
      .where(and(
        eq(debts.userId, legacyUserId),
        eq(debts.status, "active"),
        lte(debts.dueDate, weekFromNow),
      ))

    const notifications: Array<{ id: number; title: string; desc: string; time: string; read: boolean }> = []

    for (const d of dueDebts) {
      if (!d.dueDate) continue
      const isOverdue = new Date(d.dueDate) < now
      const daysLeft = Math.ceil((new Date(d.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: d.id * 100 + 1,
        title: `${d.type === "debt" ? "Hutang" : "Piutang"} akan jatuh tempo`,
        desc: `${d.name || (d.type === "debt" ? "Hutang" : "Piutang")} — Rp ${Number(d.amount).toLocaleString("id-ID")}${isOverdue ? " (terlewat)" : daysLeft <= 0 ? " (hari ini)" : ` (${daysLeft} hari lagi)`}`,
        time: formatTime(d.dueDate),
        read: false,
      })
    }

    notifications.sort((a, b) => {
      const ta = a.time === "Hari ini" ? 0 : a.time === "Besok" ? 1 : parseInt(a.time) || 99
      const tb = b.time === "Hari ini" ? 0 : b.time === "Besok" ? 1 : parseInt(b.time) || 99
      return ta - tb
    })

    return NextResponse.json(notifications.slice(0, limit))
  } catch {
    return NextResponse.json([])
  }
}

function formatTime(d: string | Date) {
  const date = new Date(d)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Hari ini"
  if (days === 1) return "Besok"
  return `${days} hari lagi`
}
