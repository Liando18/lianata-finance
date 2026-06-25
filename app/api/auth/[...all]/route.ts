import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { logAction } from "@/lib/log/activity-log"

const { GET: _GET, POST: _POST } = toNextJsHandler(auth.handler)

export const GET = _GET

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const path = url.pathname.replace("/api/auth/", "")

    const clonedReq = request.clone()
    const response = await _POST(request)

    if (response.status < 400) {
      const body = await clonedReq.json().catch(() => ({}))
      const email = body.email || body.name || "unknown"
      const actionMap: Record<string, string> = {
        "sign-in/email": "sign_in",
        "sign-up/email": "sign_up",
        "sign-out": "sign_out",
        "forgot-password": "forgot_password",
        "reset-password": "reset_password",
        "update-user": "update_user",
      }
      const action = actionMap[path]

      if (action) {
        logAction(action, "auth", {
          details: `Email: ${email}`,
          headers: request.headers,
        })
      }
    }

    return response
  } catch (e) {
    console.error("[Auth] Error:", e)
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 })
  }
}
