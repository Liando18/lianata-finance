import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [cat] = await db.select().from(categories).where(and(eq(categories.id, Number(id)), eq(categories.userId, userId)))
    if (!cat) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })

    return NextResponse.json(cat)
  } catch (e) {
    console.error("[Categories] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(categories).where(and(eq(categories.id, Number(id)), eq(categories.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })

    const body = await req.json()
    const { name, type, color, icon } = body

    if (!name?.trim()) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
    if (type && !["income", "expense"].includes(type)) return NextResponse.json({ error: "Tipe kategori tidak valid" }, { status: 400 })

    await db.update(categories).set({
      name: name.trim(),
      type: type || existing.type,
      color: color ?? existing.color,
      icon: icon ?? existing.icon,
    }).where(eq(categories.id, Number(id)))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Categories] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [existing] = await db.select().from(categories).where(and(eq(categories.id, Number(id)), eq(categories.userId, userId)))
    if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })

    await db.delete(categories).where(eq(categories.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Categories] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
