interface ITreeNode {
  left: ITreeNode | null
  right: ITreeNode | null
  splitAttr: number
  splitValue: number
  size: number
}

const EULER = 0.5772156649

function c(n: number): number {
  if (n <= 1) return 0
  const h = Math.log(n - 1) + EULER
  return 2 * h - 2 * (n - 1) / n
}

function buildTree(data: number[][], depth: number, maxDepth: number): ITreeNode {
  const n = data.length
  if (depth >= maxDepth || n <= 1) {
    return { left: null, right: null, splitAttr: -1, splitValue: 0, size: n }
  }

  const dims = data[0].length
  let allSame = true
  for (let d = 0; d < dims; d++) {
    const vals = data.map((r) => r[d])
    if (new Set(vals).size > 1) { allSame = false; break }
  }
  if (allSame) {
    return { left: null, right: null, splitAttr: -1, splitValue: 0, size: n }
  }

  const splitAttr = Math.floor(Math.random() * dims)

  const values = data.map((r) => r[splitAttr])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  if (minVal === maxVal) {
    return { left: null, right: null, splitAttr: -1, splitValue: 0, size: n }
  }

  const splitValue = minVal + Math.random() * (maxVal - minVal)

  const leftData: number[][] = []
  const rightData: number[][] = []
  for (const row of data) {
    if (row[splitAttr] < splitValue) {
      leftData.push(row)
    } else {
      rightData.push(row)
    }
  }

  if (leftData.length === 0 || rightData.length === 0) {
    return { left: null, right: null, splitAttr: -1, splitValue: 0, size: n }
  }

  return {
    splitAttr,
    splitValue,
    left: buildTree(leftData, depth + 1, maxDepth),
    right: buildTree(rightData, depth + 1, maxDepth),
    size: n,
  }
}

function pathLength(row: number[], node: ITreeNode, depth: number): number {
  if (node.left === null || node.right === null) {
    return depth + c(node.size)
  }
  if (row[node.splitAttr] < node.splitValue) {
    return pathLength(row, node.left, depth + 1)
  }
  return pathLength(row, node.right, depth + 1)
}

export interface IsolationForestOptions {
  nTrees?: number
  sampleSize?: number
  maxDepth?: number
}

export interface AnomalyScore {
  score: number
  isAnomaly: boolean
  pathLength: number
}

export class IsolationForest {
  private trees: ITreeNode[] = []
  private nTrees: number
  private sampleSize: number
  private maxDepth: number
  private c: number = 0

  constructor(opts: IsolationForestOptions = {}) {
    this.nTrees = opts.nTrees || 100
    this.sampleSize = opts.sampleSize || 256
    this.maxDepth = opts.maxDepth || Math.ceil(Math.log2(this.sampleSize))
  }

  fit(data: number[][]): void {
    const n = Math.min(this.sampleSize, data.length)
    this.c = c(n)
    this.trees = []

    for (let i = 0; i < this.nTrees; i++) {
      const sample: number[][] = []
      const indices = new Set<number>()
      while (indices.size < n) {
        indices.add(Math.floor(Math.random() * data.length))
      }
      for (const idx of indices) {
        sample.push([...data[idx]])
      }
      this.trees.push(buildTree(sample, 0, this.maxDepth))
    }
  }

  predict(row: number[]): AnomalyScore {
    let totalPathLength = 0
    for (const tree of this.trees) {
      totalPathLength += pathLength(row, tree, 0)
    }
    const avgPathLength = totalPathLength / this.trees.length
    const score = Math.pow(2, -avgPathLength / this.c)

    return {
      score,
      isAnomaly: score > 0.5,
      pathLength: avgPathLength,
    }
  }
}
