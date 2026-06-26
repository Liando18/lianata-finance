import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const url = process.env.BETTER_AUTH_URL || "https://lianata-finance.vercel.app"
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/"] },
    ],
    sitemap: `${url}/sitemap.xml`,
  }
}
