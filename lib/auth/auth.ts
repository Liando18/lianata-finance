import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import { sendResetPasswordEmail } from "@/lib/email"
import * as schema from "@/lib/db/schema"

const baseUrl = process.env.BETTER_AUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || "http://localhost:3000"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  trustedOrigins: [baseUrl],
  rateLimit: {
    enabled: true,
    window: 10,
    max: 20,
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forgot-password": { window: 60, max: 2 },
    },
  },
  user: {
    additionalFields: {
      businessType: {
        type: "string",
        required: false,
        defaultValue: null,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user: u, token }) => {
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      await sendResetPasswordEmail(u.email, resetUrl)
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
