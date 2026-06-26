"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import TransactionForm from "@/app/components/transactions/transaction-form"
import { Loader2 } from "lucide-react"

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>()
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setInitialData({
          id: d.id,
          type: d.type,
          walletId: String(d.walletId),
          categoryId: String(d.categoryId || ""),
          amount: d.amount,
          date: new Date(d.date).toISOString().split("T")[0],
          description: d.description || "",
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">Transaksi tidak ditemukan</p>
      </div>
    )
  }

  return <TransactionForm initialData={initialData as unknown as Parameters<typeof TransactionForm>[0]["initialData"]} mode="edit" />
}
