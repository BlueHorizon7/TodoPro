"use client"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Calendar, Star, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

export interface Todo {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate?: Date
  tags: string[]
  createdAt: Date
}

interface TodoCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onToggleImportant: (id: string) => void
  onRename?: (id: string, newText: string) => void
  isDragging?: boolean
}

export function TodoCard({ todo, onToggle, onDelete, onEdit, onToggleImportant, onRename, isDragging = false }: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed
  const isDueToday = todo.dueDate && todo.dueDate.toDateString() === new Date().toDateString()

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
      setEditText(todo.text)
    }
  }

  const handleSave = () => {
    const trimmedText = editText.trim()
    if (trimmedText && trimmedText !== todo.text && onRename) {
      onRename(todo.id, trimmedText)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(todo.text)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn("group", isDragging && "rotate-2 scale-105 z-50")}
    >
      <Card
        className={cn(
          "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-200",
          "hover:bg-white/10 hover:border-white/20 hover:shadow-xl",
          todo.completed && "opacity-60",
          isOverdue && "border-red-400/30 bg-red-400/5",
          isDragging && "shadow-2xl",
        )}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header: Checkbox, Title, and Actions */}
            <div className="flex items-start gap-3">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggle(todo.id)}
                className="mt-1 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      className="text-sm font-medium bg-white/10 border-white/30 focus:bg-white/20 focus:border-white/50 text-white placeholder:text-white/50"
                      placeholder="Enter todo name..."
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed break-words cursor-pointer select-none",
                      todo.completed && "line-through text-white/60",
                    )}
                    onDoubleClick={handleDoubleClick}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggleImportant(todo.id)}
                  className={cn("h-7 w-7 rounded-md", todo.important && "text-yellow-400")}
                >
                  <Star className={cn("w-3.5 h-3.5", todo.important && "fill-current")} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(todo.id)} className="h-7 w-7 rounded-md">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(todo.id)}
                  className="h-7 w-7 rounded-md text-white/60 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-2 flex-wrap">
              {todo.important && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Important
                </Badge>
              )}

              {todo.dueDate && (
                <Badge
                  variant={isOverdue ? "destructive" : "outline"}
                  className={cn(
                    "text-xs px-2 py-0.5",
                    isOverdue 
                      ? "bg-red-400/20 text-red-300 border-red-400/30" 
                      : "bg-blue-400/20 text-blue-300 border-blue-400/30"
                  )}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDueDate(todo.dueDate)}
                </Badge>
              )}
            </div>

            {/* Tags section */}
            {todo.tags.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 flex-wrap">
                  {todo.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-white/10 hover:bg-white/20 transition-colors border-white/20 text-white/80"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
