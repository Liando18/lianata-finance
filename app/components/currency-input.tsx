"use client"

import { useCallback } from "react"

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CurrencyInput({ value, onChange, placeholder = "0", className = "", disabled }: CurrencyInputProps) {
  const displayValue = value ? Number(value).toLocaleString("id-ID") : ""

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    onChange(raw)
  }, [onChange])

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted pointer-events-none">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-11 pl-10 pr-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all ${className}`}
      />
    </div>
  )
}
