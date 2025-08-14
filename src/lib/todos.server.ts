import type { Prisma, Tag, Todo } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export type UiTodo = {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate: string | null
  tags: string[]
  createdAt: string
}

function toUiTodo(todo: Todo & { tags: Tag[] }): UiTodo {
  return {
    id: todo.id,
    text: todo.title,
    completed: todo.completed,
    important: todo.important,
    dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
    tags: (todo.tags ?? []).map((t) => t.name),
    createdAt: todo.createdAt.toISOString(),
  }
}

export async function getTodosServer(params?: { q?: string; completed?: boolean; important?: boolean }) {
  const { userId } = await auth()
  if (!userId) return []
  const where: Prisma.TodoWhereInput = { archivedAt: null, userId }
  if (params?.q) {
    const q = params.q.trim()
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
      ]
    }
  }
  if (params?.important !== undefined) where.important = params.important
  if (params?.completed !== undefined) where.completed = params.completed

  const todos = await prisma.todo.findMany({
    where,
    include: { tags: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
  return todos.map(toUiTodo)
}


