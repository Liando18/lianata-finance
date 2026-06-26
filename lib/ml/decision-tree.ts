export interface DTTrainingRow {
  features: number[]
  label: string
}

interface DTNode {
  splitAttr: number
  splitValue: number
  left: DTNode | null
  right: DTNode | null
  prediction: string | null
  size: number
}

function entropy(counts: number[], total: number): number {
  if (total === 0) return 0
  return -counts.reduce((s, c) => {
    if (c === 0) return s
    const p = c / total
    return s + p * Math.log2(p)
  }, 0)
}

function bestSplit(data: DTTrainingRow[]): { attr: number; value: number; gain: number } | null {
  const total = data.length
  const labelCounts = new Map<string, number>()
  for (const d of data) labelCounts.set(d.label, (labelCounts.get(d.label) || 0) + 1)
  const currentEntropy = entropy(Array.from(labelCounts.values()), total)

  let best: { attr: number; value: number; gain: number } | null = null

  for (let a = 0; a < data[0].features.length; a++) {
    const values = [...new Set(data.map(d => d.features[a]))].sort((x, y) => x - y)
    for (const v of values) {
      const left: DTTrainingRow[] = []
      const right: DTTrainingRow[] = []
      for (const d of data) {
        if (d.features[a] <= v) left.push(d)
        else right.push(d)
      }
      if (left.length === 0 || right.length === 0) continue

      const leftCounts = new Map<string, number>()
      for (const d of left) leftCounts.set(d.label, (leftCounts.get(d.label) || 0) + 1)
      const rightCounts = new Map<string, number>()
      for (const d of right) rightCounts.set(d.label, (rightCounts.get(d.label) || 0) + 1)

      const gain = currentEntropy
        - (left.length / total) * entropy(Array.from(leftCounts.values()), left.length)
        - (right.length / total) * entropy(Array.from(rightCounts.values()), right.length)

      if (gain > (best?.gain || 0)) {
        best = { attr: a, value: v, gain }
      }
    }
  }

  return best
}

function majorityLabel(data: DTTrainingRow[]): string {
  const counts = new Map<string, number>()
  for (const d of data) counts.set(d.label, (counts.get(d.label) || 0) + 1)
  let best = ""
  let bestCount = 0
  for (const [l, c] of counts) {
    if (c > bestCount) { best = l; bestCount = c }
  }
  return best
}

function buildTree(data: DTTrainingRow[], depth: number, maxDepth: number): DTNode {
  const labels = new Set(data.map(d => d.label))
  if (labels.size === 1) {
    return { splitAttr: -1, splitValue: 0, left: null, right: null, prediction: data[0].label, size: data.length }
  }
  if (depth >= maxDepth || data.length < 2) {
    return { splitAttr: -1, splitValue: 0, left: null, right: null, prediction: majorityLabel(data), size: data.length }
  }

  const split = bestSplit(data)
  if (!split || split.gain <= 0) {
    return { splitAttr: -1, splitValue: 0, left: null, right: null, prediction: majorityLabel(data), size: data.length }
  }

  const leftData = data.filter(d => d.features[split.attr] <= split.value)
  const rightData = data.filter(d => d.features[split.attr] > split.value)

  if (leftData.length === 0 || rightData.length === 0) {
    return { splitAttr: -1, splitValue: 0, left: null, right: null, prediction: majorityLabel(data), size: data.length }
  }

  return {
    splitAttr: split.attr,
    splitValue: split.value,
    left: buildTree(leftData, depth + 1, maxDepth),
    right: buildTree(rightData, depth + 1, maxDepth),
    prediction: null,
    size: data.length,
  }
}

function predictOne(node: DTNode, features: number[]): string {
  if (node.prediction !== null) return node.prediction
  if (features[node.splitAttr] <= node.splitValue) {
    return node.left ? predictOne(node.left, features) : "unknown"
  }
  return node.right ? predictOne(node.right, features) : "unknown"
}

// ────────── Visual tree node for frontend ──────────
export interface VisualTreeNode {
  type: "split" | "leaf"
  attrName?: string
  condition?: string
  prediction?: string
  count: number
  left?: VisualTreeNode | null
  right?: VisualTreeNode | null
}

function buildVisualNode(
  node: DTNode,
  attrNames: string[],
  humanAttr: (name: string, val: number) => string,
): VisualTreeNode {
  if (node.prediction !== null) {
    return { type: "leaf", prediction: node.prediction, count: node.size }
  }
  const rawName = attrNames[node.splitAttr] || `fitur_${node.splitAttr}`
  return {
    type: "split",
    attrName: rawName,
    condition: humanAttr(rawName, node.splitValue),
    count: node.size,
    left: node.left ? buildVisualNode(node.left, attrNames, humanAttr) : null,
    right: node.right ? buildVisualNode(node.right, attrNames, humanAttr) : null,
  }
}

// ────────── Human-readable rules ──────────
export interface HumanRule {
  parts: string[]
  label: string
  description: string
  count: number
}

const ATTR_LABELS: Record<string, string> = {
  "Jumlah": "Pengeluaran",
  "Hari (Minggu)": "Hari",
  "Tgl (Bulan)": "Tanggal",
  "Jam": "Jam",
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

function formatThreshold(attr: string, value: number): string {
  if (attr === "Jumlah" || attr === "Pengeluaran") {
    return `Rp ${Number(value).toLocaleString("id-ID")}`
  }
  if (attr === "Hari (Minggu)" || attr === "Hari") {
    const dayName = DAY_NAMES[Math.floor(value)] || ""
    return `${dayName}`
  }
  if (attr === "Tgl (Bulan)" || attr === "Tanggal") {
    return `tanggal ${Math.floor(value)}`
  }
  if (attr === "Jam") {
    return `jam ${Math.floor(value)}:00`
  }
  return String(Number(value).toFixed(0))
}

function humanCondition(attr: string, value: number, comparison: "≤" | ">"): string {
  const label = ATTR_LABELS[attr] || attr
  const formatted = formatThreshold(attr, value)

  if (attr === "Hari" || attr === "Hari (Minggu)") {
    const dayIdx = Math.floor(value)
    if (comparison === "≤") {
      if (dayIdx >= 4) return "hari Jumat, Sabtu, atau Minggu"
      if (dayIdx >= 2) return "hari Rabu, Kamis, Jumat, Sabtu, atau Minggu"
      return "hari Senin, Selasa, atau Rabu"
    }
    if (dayIdx <= 0) return "hari Selasa hingga Sabtu"
    if (dayIdx <= 2) return "hari Kamis hingga Sabtu"
    return "hari Sabtu atau Minggu"
  }
  if (comparison === "≤") return `${label} ≤ ${formatted}`
  return `${label} > ${formatted}`
}

function extractHumanRules(
  node: DTNode,
  path: { attr: string; value: number; comparison: "≤" | ">" }[],
  attrNames: string[],
  allRules: HumanRule[],
): void {
  if (node.prediction !== null) {
    const parts = path.map(p => humanCondition(p.attr, p.value, p.comparison))
    const desc = `Jika ${parts.join(" dan ")}${parts.length > 0 ? "" : "semua transaksi"} → ${node.prediction}`
    allRules.push({ parts, label: node.prediction, description: desc, count: node.size })
    return
  }
  const rawName = attrNames[node.splitAttr] || `fitur_${node.splitAttr}`
  const label = ATTR_LABELS[rawName] || rawName
  if (node.left) {
    extractHumanRules(node.left, [...path, { attr: rawName, value: node.splitValue, comparison: "≤" }], attrNames, allRules)
  }
  if (node.right) {
    extractHumanRules(node.right, [...path, { attr: rawName, value: node.splitValue, comparison: ">" }], attrNames, allRules)
  }
}

export interface DecisionRule {
  condition: string
  prediction: string
  confidence: number
  count: number
}

function extractRules(node: DTNode, path: string[], attrNames: string[], allRules: DecisionRule[]): void {
  if (node.prediction !== null) {
    allRules.push({
      condition: path.join(" DAN ") || "selalu",
      prediction: node.prediction,
      confidence: 0,
      count: node.size || 0,
    })
    return
  }
  const attrName = attrNames[node.splitAttr] || `fitur_${node.splitAttr}`
  if (node.left) {
    extractRules(node.left, [...path, `${attrName} ≤ ${Number(node.splitValue).toFixed(0)}`], attrNames, allRules)
  }
  if (node.right) {
    extractRules(node.right, [...path, `${attrName} > ${Number(node.splitValue).toFixed(0)}`], attrNames, allRules)
  }
}

export interface DTResult {
  rules: DecisionRule[]
  humanRules: HumanRule[]
  visualTree: VisualTreeNode | null
  accuracy: number
  totalTrain: number
  totalTest: number
  confusionMatrix: Record<string, Record<string, number>>
}

export class DecisionTree {
  private root: DTNode | null = null
  private attrNames: string[] = []
  private maxDepth: number

  constructor(maxDepth = 4) {
    this.maxDepth = maxDepth
  }

  fit(data: DTTrainingRow[], attrNames: string[]): void {
    this.attrNames = attrNames
    this.root = buildTree(data, 0, this.maxDepth)
  }

  predict(features: number[]): string {
    if (!this.root) return "unknown"
    return predictOne(this.root, features)
  }

  evaluate(data: DTTrainingRow[]): DTResult {
    const rules: DecisionRule[] = []
    const humanRules: HumanRule[] = []
    if (this.root) {
      extractRules(this.root, [], this.attrNames, rules)
      extractHumanRules(this.root, [], this.attrNames, humanRules)
    }

    let correct = 0
    const confusionMatrix: Record<string, Record<string, number>> = {}
    for (const d of data) {
      const pred = this.predict(d.features)
      if (pred === d.label) correct++
      if (!confusionMatrix[d.label]) confusionMatrix[d.label] = {}
      confusionMatrix[d.label][pred] = (confusionMatrix[d.label][pred] || 0) + 1
    }

    const humanAttrFn = (name: string, val: number) => formatThreshold(name, val)
    const visualTree = this.root
      ? buildVisualNode(this.root, this.attrNames, humanAttrFn)
      : null

    return {
      rules,
      humanRules,
      visualTree,
      accuracy: data.length > 0 ? correct / data.length : 0,
      totalTrain: data.length,
      totalTest: data.length,
      confusionMatrix,
    }
  }
}
