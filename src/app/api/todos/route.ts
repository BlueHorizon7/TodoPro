import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { toErrorResponse } from "@/lib/errors"
import { createTodoSchema } from "@/lib/validators/todo"
import type { Prisma, Tag, Todo } from "@prisma/client"
import { parseSearchQuery } from "@/lib/search-parser"
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

function toUiTodo(todo: (Todo & { tags: Tag[] })) : UiTodo {
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

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const searchParams = req.nextUrl.searchParams
    const q = searchParams.get("q")?.trim() ?? undefined
    const completedParam = searchParams.get("completed")
    const importantParam = searchParams.get("important")

    const where: Prisma.TodoWhereInput = { archivedAt: null, userId }

    if (q) {
      const searchQuery = parseSearchQuery(q)
      
      // Text search
      if (searchQuery.text) {
        where.OR = [
          { title: { contains: searchQuery.text, mode: "insensitive" } },
          { description: { contains: searchQuery.text, mode: "insensitive" } },
        ]
      }

      // Tag search
      if (searchQuery.tags.length > 0) {
        where.tags = {
          some: {
            name: { in: searchQuery.tags, mode: "insensitive" }
          }
        }
      }

      // Date range search
      if (searchQuery.dateRange) {
        if (searchQuery.dateRange.start && searchQuery.dateRange.end) {
          where.dueDate = {
            gte: searchQuery.dateRange.start,
            lte: searchQuery.dateRange.end,
          }
        } else if (searchQuery.dateRange.start) {
          where.dueDate = {
            gte: searchQuery.dateRange.start,
          }
        } else if (searchQuery.dateRange.end) {
          where.dueDate = {
            lte: searchQuery.dateRange.end,
          }
        }
      }

      // Important filter
      if (searchQuery.important !== undefined) {
        where.important = searchQuery.important
      }

      // Completed filter
      if (searchQuery.completed !== undefined) {
        where.completed = searchQuery.completed
      }
    }

    // Also honor explicit query params when provided (outside of q)
    if (completedParam !== null) {
      if (completedParam === "true") where.completed = true
      else if (completedParam === "false") where.completed = false
    }
    if (importantParam !== null) {
      if (importantParam === "true") where.important = true
      else if (importantParam === "false") where.important = false
    }

    const todos = await prisma.todo.findMany({
      where,
      include: { tags: true },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    })

    return Response.json({ data: todos.map(toUiTodo) })
  } catch (error) {
    const { status, body } = toErrorResponse(error)
    return Response.json(body, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const json = await req.json()
    const parsed = createTodoSchema.parse(json)

    const created = await prisma.todo.create({
      data: {
        title: parsed.text,
        description: parsed.description ?? null,
        important: parsed.important ?? false,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
        userId,
        tags: parsed.tags && parsed.tags.length > 0 ? {
          connectOrCreate: parsed.tags.map((name) => ({
            where: { userId_name: { userId, name } },
            create: { name, userId },
          })),
        } : undefined,
      },
      include: { tags: true },
    })

    return Response.json({ data: toUiTodo(created) }, { status: 201 })
  } catch (error) {
    const { status, body } = toErrorResponse(error)
    return Response.json(body, { status })
  }
}


