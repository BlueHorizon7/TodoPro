"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

export function SidebarFooter() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const particlesRef = useRef<HTMLDivElement[] | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    gsap.fromTo(
      container,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1 },
    )

    const particles = container.querySelectorAll<HTMLDivElement>("[data-particle]")
    const particlesArray = Array.from(particles)
    particlesRef.current = particlesArray

    particlesArray.forEach((el, idx) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: idx * 0.2 })
      tl.to(el, { y: -6, x: 2, duration: 1.8, ease: "sine.inOut" })
        .to(el, { y: 0, x: 0, duration: 1.6, ease: "sine.inOut" })
    })

    return () => {
      if (container) gsap.killTweensOf(container)
      particlesArray.forEach((el) => gsap.killTweensOf(el))
    }
  }, [])

  return (
    <div ref={containerRef} className="relative group">
      {/* Outer gradient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/25 via-purple-500/25 to-pink-500/25 blur-xl group-hover:blur-2xl transition-all duration-500" />

      {/* Inner glass card */}
      <div className={cn(
        "relative rounded-2xl border border-white/15 bg-white/7.5 backdrop-blur-xl",
        "px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        "transition-all duration-300 group-hover:bg-white/12 group-hover:border-white/25 group-hover:scale-[1.02]"
      )}>
        {/* Animated border overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30" />
        </div>

        {/* Content */}
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1 animate-pulse">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle text-white/70">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M13.5 12.5C12.8333 13.1667 12 13.5 11 13.5C9.067 13.5 7.5 11.933 7.5 10C7.5 8.067 9.067 6.5 11 6.5C12 6.5 12.8333 6.83333 13.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]">2025</span>
          </div>
          <a
            href="https://github.com/BlueHorizon7/TodoPro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open BlueHorizon7 GitHub"
            className="inline-block text-sm font-extrabold bg-gradient-to-r from-sky-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent select-none animate-gradient-x focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-sm hover:brightness-110"
          >
            BlueHorizon7
          </a>

          {/* Decorative particles */}
          <div data-particle className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-sky-400/70 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
          <div data-particle className="absolute -top-1 -right-1 w-1 h-1 rounded-full bg-fuchsia-400/70 shadow-[0_0_10px_rgba(232,121,249,0.6)]" />
          <div data-particle className="absolute -bottom-1 -left-2 w-1 h-1 rounded-full bg-rose-400/70 shadow-[0_0_10px_rgba(251,113,133,0.6)]" />
          <div data-particle className="absolute -bottom-1 -right-2 w-1.5 h-1.5 rounded-full bg-sky-400/70 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
        </div>
      </div>
    </div>
  )
}


