"use client"

import React from "react"
import { cn } from "@/lib/utils"

type LoaderProps = {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  fullscreen?: boolean
}

export function Loader({ size = "md", text, className, fullscreen = false }: LoaderProps) {
  const dimension = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-10 w-10" : "h-7 w-7"

  const spinner = (
    <div className={cn("flex items-center gap-3", className)} role="status" aria-live="polite">
      <div
        className={cn(
          "relative",
          dimension,
          "rounded-full border-2 border-white/20",
          "before:content-[''] before:absolute before:inset-0 before:rounded-full before:border-2 before:border-transparent before:border-t-sky-400 before:animate-spin"
        )}
      />
      {text && <span className="text-sm text-white/80">{text}</span>}
    </div>
  )

  if (!fullscreen) return spinner

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      {spinner}
    </div>
  )
}


