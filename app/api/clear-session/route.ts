import { NextResponse } from "next/server"

const COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.dont_remember",
  "better-auth.account_data",
]

const SECURE_COOKIES = COOKIES.map((n) => `__Secure-${n}`)

function clearCookies(resp: NextResponse, list: string[], secure: boolean) {
  for (const name of list) {
    resp.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure,
      sameSite: "lax",
    })
  }
}

export async function GET() {
  const url = new URL("/login", process.env.BETTER_AUTH_URL || "http://localhost:3000")
  const resp = NextResponse.redirect(url)

  clearCookies(resp, COOKIES, false)
  clearCookies(resp, SECURE_COOKIES, true)

  return resp
}
