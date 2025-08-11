"use client"

import { useMemo } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DatePicker({
  date,
  onChange,
  placeholder = "Pick a date",
  disablePast = true,
  className,
}: {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disablePast?: boolean
  className?: string
}) {
  const startOfToday = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-auto h-8 text-xs bg-white/5 border-white/20 text-white justify-start",
            !date && "text-white/50",
            className,
          )}
       >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
          modifiers={{ disabled: (day) => (disablePast ? day < startOfToday : false) }}
        />
      </PopoverContent>
    </Popover>
  )
}


