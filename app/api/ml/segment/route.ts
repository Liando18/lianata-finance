import { NextResponse } from "next/server"
import { runSegmentation, getSegmentByUser } from "@/lib/ml/segment"
import { logAction } from "@/lib/log/activity-log"

export async function POST(req: Request) {
  try {
    const results = await runSegmentation()
    logAction("run_segmentation", "ml", { details: `${results.length} users segmented`, headers: req.headers })
    return NextResponse.json({ success: true, count: results.length, data: results })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const result = await getSegmentByUser(Number(userId))
      return NextResponse.json({ data: result })
    }

    return NextResponse.json({ data: null })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
