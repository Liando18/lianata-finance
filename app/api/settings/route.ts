import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { users, account } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const legacyUserId = await getLegacyUserId()

    const accts = await db
      .select()
      .from(account)
      .where(and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "email"),
      ))
      .limit(1)

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email,
      businessType: session.user.businessType || "pribadi",
      role: session.user.role || "user",
      legacyUserId,
      hasPassword: accts.length > 0,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, businessType } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 })
    }

    const validBusinessTypes = ["pribadi", "toko", "umkm", "perusahaan"]
    const bt = validBusinessTypes.includes(businessType) ? businessType : "pribadi"

    await auth.api.updateUser({
      headers: await headers(),
      body: { name: name.trim(), businessType: bt },
    })

    const legacyUserId = await getLegacyUserId()
    if (legacyUserId) {
      await db.update(users).set({ name: name.trim() }).where(eq(users.id, legacyUserId))
    }

    return NextResponse.json({ success: true, name: name.trim(), businessType: bt })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
