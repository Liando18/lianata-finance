import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const url = process.env.BETTER_AUTH_URL || "https://lianata-finance.vercel.app"
  return [
    { url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${url}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${url}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${url}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]
}
