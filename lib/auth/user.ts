import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

export async function getLegacyUserId(): Promise<number | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  if (existing) return existing.id

  const [created] = await db
    .insert(users)
    .values({ email: session.user.email, name: session.user.name || session.user.email })
    .returning({ id: users.id })

  return created?.id ?? null
}

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}
