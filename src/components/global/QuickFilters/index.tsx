"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Star, Clock } from 'lucide-react'
import { motion } from "framer-motion"

export type QuickFilter = "today" | "important" | "due-soon" | null

interface QuickFiltersProps {
  activeFilter: QuickFilter
  onFilterChange: (filter: QuickFilter) => void
}

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  const filters = [
    { key: "today" as QuickFilter, label: "Today", icon: Calendar },
    { key: "important" as QuickFilter, label: "Important", icon: Star },
    { key: "due-soon" as QuickFilter, label: "Due Soon", icon: Clock },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 flex-wrap"
    >
      {filters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(activeFilter === filter.key ? null : filter.key)}
            className="rounded-full h-8 px-3 text-xs font-medium transition-all duration-200"
          >
            <Icon className="w-3 h-3 mr-1.5" />
            {filter.label}
          </Button>
        )
      })}
    </motion.div>
  )
}
