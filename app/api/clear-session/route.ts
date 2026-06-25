import { NextResponse } from "next/server"

const COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.dont_remember",
  "better-auth.account_data",
]

export async function GET() {
  const url = new URL("/login", process.env.BETTER_AUTH_URL || "http://localhost:3000")
  const resp = NextResponse.redirect(url)

  for (const name of COOKIES) {
    resp.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
  }

  return resp
}
