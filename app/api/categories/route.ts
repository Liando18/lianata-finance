import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const conditions = [eq(categories.userId, userId)]
    if (type && ["income", "expense"].includes(type)) conditions.push(eq(categories.type, type as "income" | "expense"))

    const data = await db.select().from(categories).where(and(...conditions)).orderBy(categories.name)
    return NextResponse.json(data)
  } catch (e) {
    console.error("[Categories] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getLegacyUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, type, color, icon } = body

    if (!name?.trim()) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 })
    if (!["income", "expense"].includes(type)) return NextResponse.json({ error: "Tipe kategori tidak valid" }, { status: 400 })

    const [cat] = await db
      .insert(categories)
      .values({ userId, name: name.trim(), type, color: color || null, icon: icon || null })
      .returning({ id: categories.id, name: categories.name })

    return NextResponse.json({ success: true, id: cat.id, name: cat.name }, { status: 201 })
  } catch (e) {
    console.error("[Categories] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
