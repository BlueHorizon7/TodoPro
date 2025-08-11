"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, Tag, X, Plus } from "lucide-react"
import type { Todo } from "./TodoCard/index"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"

interface EditTodoModalProps {
  todo: Todo | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<Todo>) => void
}

export function EditTodoModal({ todo, isOpen, onClose, onSave }: EditTodoModalProps) {
  const [text, setText] = useState("")
  const [important, setImportant] = useState(false)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (todo) {
      setText(todo.text)
      setImportant(todo.important)
      setDueDate(todo.dueDate)
      setTags([...todo.tags])
    }
  }, [todo])

  const handleSave = () => {
    if (!todo || !text.trim()) return

    onSave(todo.id, {
      text: text.trim(),
      important,
      dueDate: dueDate,
      tags: tags.filter((tag) => tag.trim()),
    })
    onClose()
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave()
    }
  }

  if (!todo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Edit Todo
          </DialogTitle>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 py-4">
          {/* Todo Text */}
          <div className="space-y-2">
            <Label htmlFor="todo-text" className="text-sm font-medium">
              Todo Description
            </Label>
            <Textarea
              id="todo-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What needs to be done?"
              className="min-h-[80px] bg-background/50 border-border/50 resize-none"
              autoFocus
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <DatePicker date={dueDate} onChange={setDueDate} />
            {dueDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDueDate(undefined)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear due date
              </Button>
            )}
          </div>

          {/* Important Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mark as Important
            </Label>
            <Button
              variant={important ? "default" : "outline"}
              size="sm"
              onClick={() => setImportant(!important)}
              className="rounded-full transition-all duration-200"
            >
              <Star className={cn("w-3 h-3 mr-1", important && "fill-current")} />
              {important ? "Important" : "Normal"}
            </Button>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>

            {/* Add new tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 bg-background/50 border-border/50"
              />
              <Button
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                size="sm"
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Existing tags */}
            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-muted/50 hover:bg-muted cursor-pointer group"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag}
                        <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={onClose} className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!text.trim()} className="px-6 bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl + Enter</kbd> to save
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
