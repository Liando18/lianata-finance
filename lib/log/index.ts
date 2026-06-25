import { MongoClient, type Collection, type Document } from "mongodb"

const raw = process.env.MONGODB_URI!
const uri = raw.startsWith("url=") ? raw.slice(4) : raw

const client = new MongoClient(uri)
const db = client.db("lianata_finance")

export function getLogCollection<T extends Document>(name: string): Collection<T> {
  return db.collection<T>(name)
}
