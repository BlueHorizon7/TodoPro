import { z } from "zod"

function isNotPast(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return date >= startOfToday
}

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "Tag name is required")
  .max(50, "Tag name is too long")

export const createTodoSchema = z.object({
  text: z.string().trim().min(1, "Title is required"),
  important: z.boolean().optional().default(false),
  dueDate: z
    .string()
    .datetime()
    .refine((v) => isNotPast(v), { message: "Due date cannot be in the past" }),
  tags: z.array(tagNameSchema).optional().default([]),
  description: z.string().trim().optional(),
})

export const updateTodoSchema = z
  .object({
    text: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    important: z.boolean().optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    tags: z.array(tagNameSchema).optional(),
    archived: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate && typeof data.dueDate === "string" && !isNotPast(data.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Due date cannot be in the past",
        path: ["dueDate"],
      })
    }
  })

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>


