import { db } from "@/lib/db"
import { transactions } from "@/lib/db/schema"
import { getLogCollection } from "@/lib/log"
import { getLogCountPerUser } from "@/lib/log/activity-log"
import { IsolationForest } from "./isolation-forest"
import { sql } from "drizzle-orm"
import type { Document } from "mongodb"

interface AnomalyRecord extends Document {
  userId: number
  type: "transaction" | "log"
  resourceId?: string | number
  description: string
  amount?: number
  score: number
  detectedAt: Date
}

function col() {
  return getLogCollection<AnomalyRecord>("anomalies")
}

export interface AnomalyResult {
  userId: number
  type: "transaction" | "log"
  resourceId?: string | number
  description: string
  amount?: number
  score: number
  isAnomaly: boolean
}

function extractFeatures(txns: { amount: number; hour: number; day: number }[]): number[][] {
  if (txns.length === 0) return []
  const avgAmount = txns.reduce((s, t) => s + t.amount, 0) / txns.length
  const stdAmount = Math.sqrt(
    txns.reduce((s, t) => s + (t.amount - avgAmount) ** 2, 0) / txns.length,
  )
  const hourFreq = new Array(24).fill(0)
  for (const t of txns) hourFreq[t.hour]++
  const peakHour = hourFreq.indexOf(Math.max(...hourFreq))

  return txns.map((t) => {
    const amountNorm = stdAmount > 0 ? (t.amount - avgAmount) / stdAmount : 0
    const hourDiff = Math.min(Math.abs(t.hour - peakHour), 24 - Math.abs(t.hour - peakHour)) / 12
    const isWeekend = t.day === 0 || t.day === 6 ? 1 : 0
    return [amountNorm, hourDiff, isWeekend]
  })
}

export async function detectTransactionAnomalies(): Promise<AnomalyResult[]> {
  const rows = await db
    .select({
      userId: transactions.userId,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      id: transactions.id,
    })
    .from(transactions)
    .where(sql`${transactions.type} = 'expense'`)

  if (rows.length < 10) return []

  const features = rows.map((r) => ({
    amount: Number(r.amount),
    hour: new Date(r.date).getHours(),
    day: new Date(r.date).getDay(),
    userId: r.userId,
    description: r.description || "",
    id: r.id,
  }))

  const X = extractFeatures(features)
  const forest = new IsolationForest({ nTrees: 100, sampleSize: Math.min(256, X.length) })
  forest.fit(X)

  const results: AnomalyResult[] = []
  for (let i = 0; i < features.length; i++) {
    const pred = forest.predict(X[i])
    if (pred.isAnomaly) {
      results.push({
        userId: features[i].userId,
        type: "transaction",
        resourceId: features[i].id,
        description: features[i].description || `Transaksi Rp ${features[i].amount.toLocaleString("id-ID")}`,
        amount: features[i].amount,
        score: pred.score,
        isAnomaly: true,
      })
    }
  }

  for (const r of results) {
    await col().insertOne({
      userId: r.userId,
      type: "transaction",
      resourceId: r.resourceId,
      description: r.description,
      amount: r.amount,
      score: r.score,
      detectedAt: new Date(),
    } as AnomalyRecord)
  }

  return results
}

export async function getAnomalies(limit = 50): Promise<AnomalyResult[]> {
  const docs = await col()
    .find({})
    .sort({ detectedAt: -1 })
    .limit(limit)
    .toArray()

  return docs.map((d) => ({
    userId: d.userId,
    type: d.type as "transaction" | "log",
    resourceId: d.resourceId,
    description: d.description,
    amount: d.amount,
    score: d.score,
    isAnomaly: d.score > 0.5,
  }))
}

export async function detectLogAnomalies(): Promise<AnomalyResult[]> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const logCounts = await getLogCountPerUser(sevenDaysAgo)
  if (logCounts.length < 3) return []

  const counts = logCounts.map((l) => l.count)
  const mean = counts.reduce((s, c) => s + c, 0) / counts.length
  const std = Math.sqrt(counts.reduce((s, c) => s + (c - mean) ** 2, 0) / counts.length)

  const results: AnomalyResult[] = []
  for (const log of logCounts) {
    if (std === 0) continue
    const zScore = (log.count - mean) / std
    if (zScore > 2.5) {
      results.push({
        userId: log.userId,
        type: "log",
        description: `Aktivitas tidak biasa: ${log.count} aksi dalam 7 hari (rata-rata ${mean.toFixed(0)})`,
        score: Math.min(0.99, 1 - Math.exp(-zScore)),
        isAnomaly: true,
      })
    }
  }

  for (const r of results) {
    await col().insertOne({
      userId: r.userId,
      type: "log",
      description: r.description,
      score: r.score,
      detectedAt: new Date(),
    } as AnomalyRecord)
  }

  return results
}

export async function getAnomaliesByUser(userId: number, limit = 20): Promise<AnomalyResult[]> {
  const docs = await col()
    .find({ userId })
    .sort({ detectedAt: -1 })
    .limit(limit)
    .toArray()

  return docs.map((d) => ({
    userId: d.userId,
    type: d.type as "transaction" | "log",
    resourceId: d.resourceId,
    description: d.description,
    amount: d.amount,
    score: d.score,
    isAnomaly: d.score > 0.5,
  }))
}
