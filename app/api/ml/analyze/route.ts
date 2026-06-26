import { NextResponse } from "next/server"
import { getLegacyUserId } from "@/lib/auth/user"
import { db } from "@/lib/db"
import { transactions, categories, userSegments } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { kmeans, type Point } from "@/lib/ml/kmeans"
import { DecisionTree, type DTTrainingRow } from "@/lib/ml/decision-tree"

export const dynamic = "force-dynamic"

type SegmentLabel = "Hemat" | "Konsumtif" | "Impulsif"
const SEGMENT_ORDER: SegmentLabel[] = ["Hemat", "Konsumtif", "Impulsif"]

export async function GET() {
  try {
    const legacyUserId = await getLegacyUserId()
    if (!legacyUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rows = await db
      .select({
        amount: transactions.amount,
        date: transactions.date,
        type: transactions.type,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, legacyUserId))
      .orderBy(desc(transactions.date))

    const expenses = rows.filter(r => r.type === "expense" && r.amount !== null && Number(r.amount) > 0)
    const totalTx = rows.length
    const totalExpenses = expenses.length
    const totalIncome = rows.filter(r => r.type === "income").length

    // ── Step 1: K-Means → cluster tiap transaksi → label Hemat/Konsumtif/Impulsif ──
    let segmentData: {
      label: SegmentLabel; totalExpense: number; txnCount: number
      avgAmount: number; variance: number; calculatedAt: Date
    } | null = null

    let transactionLabels: SegmentLabel[] = []

    if (expenses.length >= 2) {
      const features = expenses.map(r => Number(r.amount))
      const k = Math.min(expenses.length, 3)

      const points: Point[] = expenses.map((r, i) => ({
        id: i,
        features: [Number(r.amount)],
      }))

      const { assignments } = kmeans(points, k, ["Hemat", "Konsumtif", "Impulsif"].slice(0, k))

      // Urutkan cluster berdasarkan rata-rata amount (terendah = Hemat, tertinggi = Impulsif)
      const clusterMeans: number[] = []
      for (let c = 0; c < k; c++) {
        const amounts = expenses.filter((_, i) => assignments[i] === c).map(r => Number(r.amount))
        clusterMeans.push(amounts.length > 0 ? amounts.reduce((s, v) => s + v, 0) / amounts.length : 0)
      }

      const clusterRank = clusterMeans
        .map((mean, idx) => ({ idx, mean }))
        .sort((a, b) => a.mean - b.mean)

      const labelByCluster = new Map<number, SegmentLabel>()
      clusterRank.forEach(({ idx }, rank) => {
        labelByCluster.set(idx, SEGMENT_ORDER[rank] || "Hemat")
      })

      transactionLabels = assignments.map(c => labelByCluster.get(c) || "Hemat")

      const totalExpense = features.reduce((s, v) => s + v, 0)
      const avgAmount = totalExpense / expenses.length
      const variance = expenses.length > 1
        ? features.reduce((s, v) => s + (v - avgAmount) ** 2, 0) / expenses.length
        : 0

      const dominantCounts = new Map<SegmentLabel, number>()
      for (const l of transactionLabels) {
        dominantCounts.set(l, (dominantCounts.get(l) || 0) + 1)
      }
      let dominantLabel: SegmentLabel = "Hemat"
      let maxCount = 0
      for (const [l, c] of dominantCounts) {
        if (c > maxCount) { dominantLabel = l; maxCount = c }
      }

      segmentData = {
        label: dominantLabel,
        totalExpense,
        txnCount: expenses.length,
        avgAmount,
        variance,
        calculatedAt: new Date(),
      }

      await db
        .insert(userSegments)
        .values({
          userId: legacyUserId,
          segment: dominantLabel,
          totalExpense: String(totalExpense),
          txnCount: expenses.length,
          avgAmount: String(avgAmount),
          variance: String(variance),
          calculatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userSegments.userId,
          set: {
            segment: dominantLabel,
            totalExpense: String(totalExpense),
            txnCount: expenses.length,
            avgAmount: String(avgAmount),
            variance: String(variance),
            calculatedAt: new Date(),
          },
        })
    }

    // ── Step 2: Decision Tree → belajar dari label K-Means ──
    let decisionTree = null
    if (transactionLabels.length >= 2) {
      const featureData: DTTrainingRow[] = expenses.map((r, i) => {
        const d = new Date(r.date)
        return {
          features: [
            Number(r.amount),
            d.getDay(),
            d.getDate(),
          ],
          label: transactionLabels[i],
        }
      })

      const dt = new DecisionTree(3)
      dt.fit(featureData, ["Jumlah", "Hari (Minggu)", "Tgl (Bulan)"])
      decisionTree = dt.evaluate(featureData)
    }

    // ── Category Breakdown ──
    const categoryBreakdown: Record<string, { count: number; total: number; avg: number }> = {}
    for (const r of expenses) {
      const cat = r.categoryName || "Tanpa Kategori"
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, total: 0, avg: 0 }
      categoryBreakdown[cat].count++
      categoryBreakdown[cat].total += Number(r.amount)
    }
    for (const cat of Object.keys(categoryBreakdown)) {
      categoryBreakdown[cat].avg = categoryBreakdown[cat].count > 0
        ? categoryBreakdown[cat].total / categoryBreakdown[cat].count
        : 0
    }

    const sortedCats = Object.entries(categoryBreakdown)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      userId: legacyUserId,
      totalTransactions: totalTx,
      totalExpenses,
      totalIncome,
      segment: segmentData,
      decisionTree,
      categoryBreakdown: sortedCats,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
