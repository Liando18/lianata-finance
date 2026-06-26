"use client"

import { useEffect, useState } from "react"
import { Loader2, Brain, GitBranch, PieChart, AlertTriangle } from "lucide-react"

interface SegmentData {
  label: string
  totalExpense: number
  txnCount: number
  avgAmount: number
  variance: number
  calculatedAt: string
}

interface VisualTreeNode {
  type: "split" | "leaf"
  attrName?: string
  condition?: string
  prediction?: string
  count: number
  left?: VisualTreeNode | null
  right?: VisualTreeNode | null
}

interface HumanRule {
  parts: string[]
  label: string
  description: string
  count: number
}

interface DTResult {
  humanRules: HumanRule[]
  visualTree: VisualTreeNode | null
  accuracy: number
  totalTrain: number
  totalTest: number
}

interface CategoryBreakdown {
  name: string
  count: number
  total: number
  avg: number
}

interface AnalysisData {
  userId: number
  totalTransactions: number
  totalExpenses: number
  totalIncome: number
  segment: SegmentData | null
  decisionTree: DTResult | null
  categoryBreakdown: CategoryBreakdown[]
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
  return n.toLocaleString("id-ID")
}

const segmentColors: Record<string, string> = {
  Hemat: "from-emerald-500 to-emerald-600",
  Konsumtif: "from-amber-500 to-orange-600",
  Impulsif: "from-rose-500 to-pink-600",
}

const segmentIcons: Record<string, string> = {
  Hemat: "💎",
  Konsumtif: "🛍️",
  Impulsif: "⚡",
}

const segmentDescriptions: Record<string, string> = {
  Hemat: "Anda cenderung bijak dalam mengelola pengeluaran. Setiap transaksi dipertimbangkan dengan baik dan Anda memiliki kontrol keuangan yang baik.",
  Konsumtif: "Anda memiliki kecenderungan untuk membelanjakan lebih dari yang diperlukan. Coba evaluasi kembali prioritas belanja Anda.",
  Impulsif: "Anda sering membuat keputusan pembelian secara spontan tanpa perencanaan. Mulai catat pengeluaran sebelum membeli.",
}

const predictionColors: Record<string, string> = {
  Hemat: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Konsumtif: "bg-amber-100 text-amber-700 border-amber-200",
  Impulsif: "bg-rose-100 text-rose-700 border-rose-200",
}

function TreeNode({ node, depth = 0 }: { node: VisualTreeNode; depth?: number }) {
  if (node.type === "leaf") {
    return (
      <div className="inline-flex flex-col items-center">
        <div className={`px-4 py-2 rounded-xl border-2 shadow-sm ${predictionColors[node.prediction || ""] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
          <p className="text-sm font-bold">{node.prediction}</p>
          <p className="text-[10px] opacity-70">{node.count} sampel</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="px-4 py-2.5 rounded-xl bg-violet-50 border-2 border-violet-200 shadow-sm text-center max-w-[260px]">
        <p className="text-xs font-semibold text-violet-700">Apakah {node.attrName} {node.condition}?</p>
      </div>
      <div className="flex items-start justify-center gap-4 sm:gap-8 mt-3 w-full">
        {node.left && (
          <div className="flex flex-col items-center flex-1">
            <div className="w-px h-4 bg-violet-300" />
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ya
            </div>
            <TreeNode node={node.left} depth={depth + 1} />
          </div>
        )}
        {node.right && (
          <div className="flex flex-col items-center flex-1">
            <div className="w-px h-4 bg-violet-300" />
            <div className="flex items-center gap-1 text-[10px] text-rose-600 font-medium mb-1 bg-rose-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Tidak
            </div>
            <TreeNode node={node.right} depth={depth + 1} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ml/analyze")
      .then(r => r.json())
      .then(j => setData(j.error ? null : j))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Menganalisis keuangan...</p></div>
    </div>
  )

  if (!data || data.totalExpenses < 2) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-sm font-medium text-muted">Belum ada cukup data untuk dianalisis</p>
        <p className="text-xs text-muted/70">Catat minimal 2 transaksi pengeluaran untuk melihat hasil analisis</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Analisis Keuangan</h1>
          <p className="text-sm text-muted">{data.totalTransactions} transaksi · {data.totalExpenses} pengeluaran · {data.totalIncome} pemasukan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── K-Means Segment ─── */}
        <div className="lg:col-span-1">
          <div className="h-full bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">K-Means</h2>
                <p className="text-[11px] text-muted">Klasterisasi pola belanja</p>
              </div>
            </div>
            <div className="flex-1 px-4 sm:px-5 py-4 space-y-3">
              {data.segment ? (
                <>
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${segmentColors[data.segment.label] || "from-gray-500 to-gray-600"} text-white`}>
                    <div className="text-2xl mb-1">{segmentIcons[data.segment.label] || "📊"}</div>
                    <p className="text-lg font-bold">{data.segment.label}</p>
                    <p className="text-xs text-white/80 mt-1">{segmentDescriptions[data.segment.label]}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[11px] text-muted">Total Pengeluaran</p>
                      <p className="text-sm font-bold text-foreground">{fmtShort(data.segment.totalExpense)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[11px] text-muted">Rata-rata</p>
                      <p className="text-sm font-bold text-foreground">{fmtShort(data.segment.avgAmount)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[11px] text-muted">Frekuensi</p>
                      <p className="text-sm font-bold text-foreground">{data.segment.txnCount}x</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50">
                      <p className="text-[11px] text-muted">Variansi</p>
                      <p className="text-sm font-bold text-foreground">{fmtShort(data.segment.variance)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted/60">
                    Terakhir: {new Date(data.segment.calculatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                  <Brain className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-muted">Segmentasi belum tersedia</p>
                  <p className="text-xs text-muted/60">Data akan terisi setelah ada cukup transaksi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Decision Tree + Kategori ─── */}
        <div className="lg:col-span-2 space-y-4">
          {data.decisionTree && data.decisionTree.visualTree && (
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Decision Tree</h2>
                  <p className="text-[11px] text-muted">Akurasi {(data.decisionTree.accuracy * 100).toFixed(0)}% dari {data.decisionTree.totalTrain} transaksi</p>
                </div>
              </div>

              {/* Tree */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <div className="min-w-[500px] flex justify-center">
                  <TreeNode node={data.decisionTree.visualTree} />
                </div>
              </div>

              {/* Human rules */}
              {data.decisionTree.humanRules.length > 0 && (
                <div className="px-4 sm:px-5 pb-5 space-y-2">
                  <p className="text-xs font-semibold text-foreground border-t border-border/40 pt-4 mb-2">Aturan yang ditemukan:</p>
                  {data.decisionTree.humanRules.map((rule, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-border/30">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-violet-600">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted">{rule.description}</p>
                          <p className="text-[10px] text-muted/60 mt-0.5">{rule.count} dari {data.decisionTree!.totalTrain} transaksi</p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${predictionColors[rule.label] || "text-gray-600 bg-gray-100"}`}>
                          {rule.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border/50 shadow-sm">
            <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shrink-0">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Kategori Pengeluaran</h2>
                <p className="text-[11px] text-muted">{data.categoryBreakdown.length} kategori</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-2">
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">Belum ada data pengeluaran</p>
              ) : (
                data.categoryBreakdown.slice(0, 8).map((cat, i) => {
                  const totalAll = data.categoryBreakdown.reduce((s, c) => s + c.total, 0)
                  const pct = totalAll > 0 ? (cat.total / totalAll) * 100 : 0
                  return (
                    <div key={cat.name} className="flex items-center gap-3 py-1.5">
                      <span className="text-xs text-muted w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{cat.name}</span>
                          <span className="text-xs font-semibold text-foreground">{fmtShort(cat.total)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-muted">{cat.count}x · rata-rata {fmtShort(cat.avg)}</span>
                          <span className="text-[10px] text-muted">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
