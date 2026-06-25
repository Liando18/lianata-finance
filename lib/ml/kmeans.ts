export interface Point {
  id: number
  features: number[]
}

export interface Centroid {
  features: number[]
  label: string
}

function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, _, i) => sum + (a[i] - b[i]) ** 2, 0))
}

function mean(points: Point[]): number[] {
  const n = points.length
  if (n === 0) return []
  const dim = points[0].features.length
  return Array.from({ length: dim }, (_, d) =>
    points.reduce((s, p) => s + p.features[d], 0) / n,
  )
}

function nearestCentroid(point: Point, centroids: Centroid[]): number {
  let minDist = Infinity
  let idx = 0
  for (let i = 0; i < centroids.length; i++) {
    const dist = euclidean(point.features, centroids[i].features)
    if (dist < minDist) {
      minDist = dist
      idx = i
    }
  }
  return idx
}

function initCentroids(points: Point[], k: number): Centroid[] {
  const centroids: Centroid[] = []
  centroids.push({ features: [...points[Math.floor(Math.random() * points.length)].features], label: "" })
  for (let c = 1; c < k; c++) {
    const dists = points.map((p) => {
      const minDist = Math.min(
        ...centroids.map((cent) => euclidean(p.features, cent.features)),
      )
      return minDist ** 2
    })
    const totalDist = dists.reduce((a, b) => a + b, 0)
    let r = Math.random() * totalDist
    let chosen = 0
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i]
      if (r <= 0) {
        chosen = i
        break
      }
    }
    centroids.push({ features: [...points[chosen].features], label: "" })
  }
  return centroids
}

export function kmeans(
  points: Point[],
  k: number,
  labels: string[],
  maxIter = 100,
): { assignments: number[]; centroids: Centroid[] } {
  if (points.length === 0 || k < 2) {
    return { assignments: points.map(() => 0), centroids: [] }
  }

  let centroids = initCentroids(points, k)
  let assignments: number[] = new Array(points.length).fill(-1)

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = points.map((p) => nearestCentroid(p, centroids))
    const changed = newAssignments.some((a, i) => a !== assignments[i])
    assignments = newAssignments
    if (!changed) break

    for (let c = 0; c < k; c++) {
      const clusterPoints = points.filter((_, i) => assignments[i] === c)
      if (clusterPoints.length > 0) {
        centroids[c].features = mean(clusterPoints)
      }
    }
  }

  const centroidAvgDist = centroids.map((cent) => {
    const cluster = points.filter((_, i) => assignments[i] === centroids.indexOf(cent))
    if (cluster.length === 0) return 0
    return cluster.reduce((s, p) => s + euclidean(p.features, cent.features), 0) / cluster.length
  })

  const sortedIndices = centroidAvgDist
    .map((_, i) => i)
    .sort((a, b) => centroidAvgDist[a] - centroidAvgDist[b])

  const sortedLabels = ["Hemat", "Konsumtif", "Impulsif"].slice(0, k)
  const labelMap = new Map<number, string>()
  sortedIndices.forEach((origIdx, rank) => {
    labelMap.set(origIdx, sortedLabels[rank] || `Cluster ${origIdx}`)
  })

  centroids = centroids.map((c, i) => ({ ...c, label: labelMap.get(i) || `Cluster ${i}` }))

  return { assignments, centroids }
}
