export interface SearchQuery {
  text: string
  tags: string[]
  dateRange?: {
    start?: Date
    end?: Date
  }
  important?: boolean
  completed?: boolean
}

export function parseSearchQuery(query: string): SearchQuery {
  const result: SearchQuery = {
    text: "",
    tags: [],
  }

  // Split by spaces but preserve quoted strings
  const parts = query.match(/(?:[^\s"']+|"[^"]*"|'[^']*')/g) || []

  for (const part of parts) {
    const trimmedPart = part.replace(/^["']|["']$/g, "") // Remove quotes

    // Check for @tag: syntax
    if (trimmedPart.startsWith("@tag:")) {
      const tag = trimmedPart.slice(5).trim()
      if (tag) {
        result.tags.push(tag)
      }
      continue
    }

    // Check for /date: syntax
    if (trimmedPart.startsWith("/date:")) {
      const dateStr = trimmedPart.slice(6).trim()
      if (dateStr) {
        const dateRange = parseDateRange(dateStr)
        if (dateRange) {
          result.dateRange = dateRange
        }
      }
      continue
    }

    // Check for @important: syntax
    if (trimmedPart.startsWith("@important:")) {
      const value = trimmedPart.slice(11).trim().toLowerCase()
      if (value === "true" || value === "yes") {
        result.important = true
      } else if (value === "false" || value === "no") {
        result.important = false
      }
      continue
    }

    // Check for @completed: syntax
    if (trimmedPart.startsWith("@completed:")) {
      const value = trimmedPart.slice(11).trim().toLowerCase()
      if (value === "true" || value === "yes") {
        result.completed = true
      } else if (value === "false" || value === "no") {
        result.completed = false
      }
      continue
    }

    // Regular text search
    if (trimmedPart && !trimmedPart.startsWith("@") && !trimmedPart.startsWith("/")) {
      result.text += (result.text ? " " : "") + trimmedPart
    }
  }

  return result
}

function parseDateRange(dateStr: string): { start?: Date; end?: Date } | null {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Handle relative dates
  switch (dateStr.toLowerCase()) {
    case "today":
      return { start: today, end: today }
    case "tomorrow":
      return { start: tomorrow, end: tomorrow }
    case "this-week":
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return { start: startOfWeek, end: endOfWeek }
    case "next-week":
      const nextWeekStart = new Date(today)
      nextWeekStart.setDate(today.getDate() + (7 - today.getDay()))
      const nextWeekEnd = new Date(nextWeekStart)
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
      return { start: nextWeekStart, end: nextWeekEnd }
    case "overdue":
      return { end: today }
    case "due-soon":
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(today.getDate() + 3)
      return { start: today, end: threeDaysFromNow }
  }

  // Handle date ranges (e.g., "2024-01-01:2024-01-31")
  if (dateStr.includes(":")) {
    const [startStr, endStr] = dateStr.split(":")
    const start = new Date(startStr.trim())
    const end = new Date(endStr.trim())
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { start, end }
    }
  }

  // Handle single date
  const singleDate = new Date(dateStr)
  if (!isNaN(singleDate.getTime())) {
    return { start: singleDate, end: singleDate }
  }

  return null
}

export function formatSearchQuery(query: SearchQuery): string {
  const parts: string[] = []

  if (query.text) {
    parts.push(query.text)
  }

  if (query.tags.length > 0) {
    parts.push(...query.tags.map(tag => `@tag:${tag}`))
  }

  if (query.important !== undefined) {
    parts.push(`@important:${query.important}`)
  }

  if (query.completed !== undefined) {
    parts.push(`@completed:${query.completed}`)
  }

  if (query.dateRange) {
    if (query.dateRange.start && query.dateRange.end) {
      if (query.dateRange.start.getTime() === query.dateRange.end.getTime()) {
        parts.push(`/date:${query.dateRange.start.toISOString().split('T')[0]}`)
      } else {
        parts.push(`/date:${query.dateRange.start.toISOString().split('T')[0]}:${query.dateRange.end.toISOString().split('T')[0]}`)
      }
    } else if (query.dateRange.start) {
      parts.push(`/date:${query.dateRange.start.toISOString().split('T')[0]}:`)
    } else if (query.dateRange.end) {
      parts.push(`/date::${query.dateRange.end.toISOString().split('T')[0]}`)
    }
  }

  return parts.join(" ")
}
