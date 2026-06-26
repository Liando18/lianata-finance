import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru harus diisi" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 })
    }

    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword, newPassword },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Password lama salah atau terjadi kesalahan" }, { status: 400 })
  }
}
