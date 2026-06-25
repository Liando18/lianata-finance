"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "google"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md":
              variant === "default",
            "border border-border bg-white text-foreground hover:bg-primary-50 hover:border-primary-200 active:bg-primary-100":
              variant === "outline",
            "text-foreground hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100":
              variant === "ghost",
            "border border-border bg-white text-foreground hover:bg-gray-50 shadow-sm":
              variant === "google",
          },
          {
            "h-9 px-3 text-sm gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-12 px-6 text-base gap-2.5": size === "lg",
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, type ButtonProps }
