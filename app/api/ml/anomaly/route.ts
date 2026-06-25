import { NextResponse } from "next/server"
import {
  detectTransactionAnomalies,
  detectLogAnomalies,
  getAnomalies,
  getAnomaliesByUser,
} from "@/lib/ml/anomaly"
import { logAction } from "@/lib/log/activity-log"

export async function POST(req: Request) {
  try {
    const [txAnomalies, logAnomalies] = await Promise.all([
      detectTransactionAnomalies(),
      detectLogAnomalies(),
    ])

    logAction("run_anomaly_detection", "ml", {
      details: `${txAnomalies.length} tx + ${logAnomalies.length} log anomalies`,
      headers: req.headers,
    })

    return NextResponse.json({
      success: true,
      transactionAnomalies: txAnomalies,
      logAnomalies,
      total: txAnomalies.length + logAnomalies.length,
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const limit = Number(searchParams.get("limit") || "50")

    if (userId) {
      const data = await getAnomaliesByUser(Number(userId), limit)
      return NextResponse.json({ data })
    }

    const data = await getAnomalies(limit)
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
