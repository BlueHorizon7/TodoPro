import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { AppError, toErrorResponse } from "@/lib/errors"
import { updateTodoSchema } from "@/lib/validators/todo"
import type { Tag, Todo } from "@prisma/client"
import { auth } from "@clerk/nextjs/server"

type TodoWithTags = Todo & { tags: Tag[] }

function toUiTodo(todo: TodoWithTags) {
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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = auth()
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const todo = await prisma.todo.findFirst({ where: { id, userId }, include: { tags: true } })
    if (!todo) throw new AppError("Todo not found", 404)
    return Response.json({ data: toUiTodo(todo) })
  } catch (error) {
    const { status, body } = toErrorResponse(error)
    return Response.json(body, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = auth()
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const json = await req.json()
    const parsed = updateTodoSchema.parse(json)

    const existing = await prisma.todo.findFirst({ where: { id, userId }, include: { tags: true } })
    if (!existing) throw new AppError("Todo not found", 404)

    const tagOps = parsed.tags
      ? {
          set: [], // Clear existing tags first
          connectOrCreate: parsed.tags.map((name) => ({
            where: { userId_name: { userId, name } },
            create: { name, userId },
          })),
        }
      : undefined

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        title: parsed.text ?? undefined,
        description: parsed.description ?? undefined,
        important: parsed.important ?? undefined,
        completed: parsed.completed ?? undefined,
        completedAt:
          parsed.completed === undefined
            ? undefined
            : parsed.completed
              ? new Date()
              : null,
        dueDate:
          parsed.dueDate === undefined
            ? undefined
            : parsed.dueDate === null
              ? null
              : new Date(parsed.dueDate),
        tags: tagOps,
        archivedAt: parsed.archived === undefined ? undefined : parsed.archived ? new Date() : null,
      },
      include: { tags: true },
    })

    return Response.json({ data: toUiTodo(updated) })
  } catch (error) {
    const { status, body } = toErrorResponse(error)
    return Response.json(body, { status })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = auth()
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    // Soft delete, scoped to owner
    const existing = await prisma.todo.findFirst({ where: { id, userId } })
    if (!existing) throw new AppError("Todo not found", 404)
    const updated = await prisma.todo.update({
      where: { id },
      data: { archivedAt: new Date() },
      include: { tags: true },
    })
    return Response.json({ data: toUiTodo(updated) })
  } catch (error) {
    const { status, body } = toErrorResponse(error)
    return Response.json(body, { status })
  }
}


