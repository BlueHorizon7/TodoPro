"use client"

import { memo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Tag, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"

interface AddTodoFormProps {
  onAdd: (todo: {
    text: string
    important: boolean
    dueDate?: Date
    tags: string[]
  }) => void
}

function AddTodoFormComponent({ onAdd }: AddTodoFormProps) {
  const [text, setText] = useState("")
  const [important, setImportant] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  const handleSubmit = () => {
    if (text.trim()) {
      const pendingTag = tagInput.trim()
      const allTags = Array.from(new Set([...
        tags,
        ...(pendingTag ? [pendingTag] : []),
      ]))

      onAdd({
        text: text.trim(),
        important,
        dueDate: dueDate || undefined, // Make due date truly optional
        tags: allTags,
      })
      setText("")
      setImportant(false)
      setTags([])
      setTagInput("")
      setDueDate(undefined)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="premium-card">
        <CardContent className="p-6 space-y-4">
          {/* Main input */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Add a new todo..."
              className="bg-white/5 border-white/20 rounded-lg h-12 px-4 text-base text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/30"
            />
            <Button
              onClick={handleSubmit}
              className="h-12 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20"
              disabled={!text.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Additional options */}
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant={important ? "default" : "outline"}
              size="sm"
              onClick={() => setImportant(!important)}
              className="rounded-full h-8 bg-white/5 border-white/20 text-white hover:bg-white/10 data-[state=on]:bg-white/20"
            >
              <Star className={`w-3 h-3 mr-1.5 ${important ? "fill-current" : ""}`} />
              Important
            </Button>

            <DatePicker date={dueDate} onChange={setDueDate} placeholder="Select due date" />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tag className="w-4 h-4 text-white/60" />
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add tag..."
                className="w-full sm:w-24 h-8 text-xs bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Tags display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-1 cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const AddTodoForm = memo(AddTodoFormComponent)
