import { db } from "@/lib/db"
import { transactions, wallets, userSegments } from "@/lib/db/schema"
import { kmeans, type Point } from "./kmeans"
import { eq, gte, sql } from "drizzle-orm"

interface UserFeatures {
  userId: number
  totalExpense: number
  txnCount: number
  avgAmount: number
  variance: number
}

async function getUserFeatures(startDate: Date): Promise<UserFeatures[]> {
  const rows = await db
    .select({
      userId: transactions.userId,
      totalExpense: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      txnCount: sql<number>`COUNT(*)`,
      avgAmount: sql<number>`COALESCE(AVG(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.type} = 'expense' AND ${transactions.date} >= ${startDate}`,
    )
    .groupBy(transactions.userId)

  const features: UserFeatures[] = []
  for (const row of rows) {
    const amounts = await db
      .select({ amount: transactions.amount })
      .from(transactions)
      .where(
        sql`${transactions.userId} = ${row.userId} AND ${transactions.type} = 'expense' AND ${transactions.date} >= ${startDate}`,
      )

    const mean = row.avgAmount
    const variance =
      amounts.length > 1
        ? amounts.reduce((s, a) => s + (Number(a.amount) - mean) ** 2, 0) / amounts.length
        : 0

    features.push({
      userId: row.userId,
      totalExpense: Number(row.totalExpense),
      txnCount: Number(row.txnCount),
      avgAmount: mean,
      variance,
    })
  }
  return features
}

function normalize(features: UserFeatures[]): { points: Point[]; userIds: number[] } {
  const dims = ["totalExpense", "txnCount", "avgAmount", "variance"] as const
  const mins: number[] = []
  const maxs: number[] = []

  for (const d of dims) {
    const vals = features.map((f) => f[d])
    mins.push(Math.min(...vals))
    maxs.push(Math.max(...vals))
  }

  const userIds: number[] = []
  const points: Point[] = features.map((f, i) => {
    userIds.push(f.userId)
    return {
      id: i,
      features: dims.map((d, di) => {
        const range = maxs[di] - mins[di]
        return range > 0 ? (Number(f[d]) - mins[di]) / range : 0.5
      }),
    }
  })

  return { points, userIds }
}

const labelOrder = ["Hemat", "Konsumtif", "Impulsif"] as const
export type SegmentLabel = (typeof labelOrder)[number]

export interface SegmentResult {
  userId: number
  label: SegmentLabel
  totalExpense: number
  txnCount: number
  avgAmount: number
  variance: number
}

export async function runSegmentation(): Promise<SegmentResult[]> {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const features = await getUserFeatures(threeMonthsAgo)
  if (features.length < 3) return []

  const { points, userIds } = normalize(features)
  const { assignments, centroids } = kmeans(points, 3, ["Hemat", "Konsumtif", "Impulsif"])

  const labelByCluster = new Map<number, string>()
  centroids.forEach((c, i) => labelByCluster.set(i, c.label))

  const results: SegmentResult[] = assignments.map((clusterIdx, i) => ({
    userId: userIds[i],
    label: (labelByCluster.get(clusterIdx) || "Hemat") as SegmentLabel,
    totalExpense: features[i].totalExpense,
    txnCount: features[i].txnCount,
    avgAmount: features[i].avgAmount,
    variance: features[i].variance,
  }))

  for (const r of results) {
    await db
      .insert(userSegments)
      .values({
        userId: r.userId,
        segment: r.label,
        totalExpense: String(r.totalExpense),
        txnCount: r.txnCount,
        avgAmount: String(r.avgAmount),
        variance: String(r.variance),
        calculatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userSegments.userId,
        set: {
          segment: r.label,
          totalExpense: String(r.totalExpense),
    txnCount: Number(r.txnCount) || 0,
          avgAmount: String(r.avgAmount),
          variance: String(r.variance),
          calculatedAt: new Date(),
        },
      })
  }

  return results
}

export async function getSegmentByUser(userId: number): Promise<SegmentResult | null> {
  const row = await db
    .select()
    .from(userSegments)
    .where(eq(userSegments.userId, userId))
    .limit(1)

  if (row.length === 0) return null

  const r = row[0]
  return {
    userId: r.userId,
    label: r.segment as SegmentLabel,
    totalExpense: Number(r.totalExpense) || 0,
    txnCount: r.txnCount ?? 0,
    avgAmount: Number(r.avgAmount) || 0,
    variance: Number(r.variance) || 0,
  }
}
