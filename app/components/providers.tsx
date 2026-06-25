"use client"

import { Toaster } from "sonner"
import { NavigationLoader } from "@/app/components/navigation-loader"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NavigationLoader />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  )
}
