import { getLogCollection } from "./index"
import type { OptionalId, Document } from "mongodb"

export interface ActivityLog extends Document {
  userId?: number
  action: string
  resource: string
  resourceId?: string | number
  details?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

function col() {
  return getLogCollection<OptionalId<ActivityLog>>("activity_logs")
}

export async function createLog(data: Omit<ActivityLog, "createdAt">): Promise<void> {
  await col().insertOne({ ...data, createdAt: new Date() } as ActivityLog).catch(() => {})
}

export function logAction(
  action: string,
  resource: string,
  opts?: { userId?: number; resourceId?: string | number; details?: string; headers?: Headers },
) {
  const ip = opts?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
    || opts?.headers?.get("x-real-ip")
    || undefined
  const ua = opts?.headers?.get("user-agent") || undefined

  createLog({
    userId: opts?.userId,
    action,
    resource,
    resourceId: opts?.resourceId,
    details: opts?.details,
    ipAddress: ip,
    userAgent: ua,
  }).catch(() => {})
}

export async function getLogs(limit = 50, skip = 0): Promise<ActivityLog[]> {
  return col()
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .toArray()
}

export async function getLogsByUser(userId: number, limit = 20): Promise<ActivityLog[]> {
  return col()
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function getLogCountPerUser(since: Date): Promise<{ userId: number; count: number }[]> {
  const pipeline = [
    { $match: { userId: { $exists: true }, createdAt: { $gte: since } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $project: { userId: "$_id", count: 1, _id: 0 } },
  ]
  return col().aggregate<{ userId: number; count: number }>(pipeline).toArray()
}
