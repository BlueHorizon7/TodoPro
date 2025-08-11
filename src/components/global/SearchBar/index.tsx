"use client"

import { Search, X, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search todos, tags..." }: SearchBarProps) {
  const [showHelp, setShowHelp] = useState(false)
  const clearSearch = () => onChange("")

  const hasAdvancedSyntax = value.includes("@") || value.includes("/")

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative w-96">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-md animate-pulse" />
            {/* Glass effect container */}
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-lg">
              <Search className="text-white/90 w-4 h-4 drop-shadow-sm" />
            </div>
          </div>
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-14 pr-16 bg-white/5 border-white/20 rounded-xl h-12 text-base backdrop-blur-sm focus:bg-white/10 focus:border-white/30 transition-all duration-200 text-white placeholder:text-white/50 shadow-lg",
            hasAdvancedSyntax && "border-purple-400/50 bg-purple-400/5"
          )}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm p-4 bg-black/90 border-white/20 text-white">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">Advanced Search Syntax</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="text-blue-300">@tag:work</code> - Search by tag</div>
                  <div><code className="text-blue-300">/date:today</code> - Search by date</div>
                  <div><code className="text-blue-300">@important:true</code> - Important todos</div>
                  <div><code className="text-blue-300">@completed:false</code> - Active todos</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Examples: <code>@tag:work /date:today</code>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search results indicator */}
        {value && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full shadow-lg",
              hasAdvancedSyntax 
                ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                : "bg-gradient-to-r from-blue-400 to-purple-400"
            )}
          />
        )}
      </motion.div>
    </TooltipProvider>
  )
}
