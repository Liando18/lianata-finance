"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CategoryForm from "@/app/components/categories/category-form"
import { Loader2 } from "lucide-react"

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/categories/${id}`).then(r => r.json()).then(d => {
      setInitialData({ id: d.id, name: d.name, type: d.type, color: d.color || "#c12a58" })
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-xl mx-auto"><div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat data...</p></div></div>
  if (!initialData) return <div className="max-w-xl mx-auto text-center py-12"><p className="text-sm text-muted">Kategori tidak ditemukan</p></div>

  return <CategoryForm initialData={initialData as unknown as Parameters<typeof CategoryForm>[0]["initialData"]} mode="edit" />
}
