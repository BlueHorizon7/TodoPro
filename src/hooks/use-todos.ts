import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type UiTodo = {
  id: string
  text: string
  completed: boolean
  important: boolean
  dueDate: string | null
  tags: string[]
  createdAt: string
}

const TODOS_KEY = ["todos"] as const

export function useTodos(params?: { q?: string; completed?: boolean | null; important?: boolean | null }) {
  const queryClient = useQueryClient()
  const search = new URLSearchParams()
  if (params?.q) search.set("q", params.q)
  if (params?.completed !== undefined && params?.completed !== null) search.set("completed", String(params.completed))
  if (params?.important !== undefined && params?.important !== null) search.set("important", String(params.important))
  
  // Avoid noisy logs in production for smoother performance

  const queryKey = useMemo(() => [
    ...TODOS_KEY,
    params?.q ?? null,
    params?.completed ?? null,
    params?.important ?? null,
  ], [params?.q, params?.completed, params?.important])

  const list = useQuery({
    queryKey,
    queryFn: async (): Promise<UiTodo[]> => {
      const res = await fetch(`/api/todos${search.toString() ? `?${search.toString()}` : ""}`)
      if (!res.ok) throw new Error("Failed to fetch todos")
      const data = (await res.json()).data as UiTodo[]
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: { text: string; important: boolean; dueDate?: Date; tags: string[] }) => {
      const payload = {
        text: input.text,
        important: input.important,
        dueDate: input.dueDate ? input.dueDate.toISOString() : null,
        tags: input.tags,
      }
      
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(`Failed to create todo: ${errorData.error || res.statusText}`)
      }
      
      const result = await res.json()
      return result.data as UiTodo
    },
    onSuccess: (newTodo) => {
      queryClient.setQueryData<UiTodo[]>(queryKey, (old) => (old ? [newTodo, ...old] : [newTodo]))
    },
  })

  type UpdatePayload = {
    text?: string
    important?: boolean
    completed?: boolean
    dueDate?: Date | null
    tags?: string[]
  }

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePayload }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: updates.text,
          important: updates.important,
          completed: updates.completed,
          dueDate: updates.dueDate === undefined ? undefined : updates.dueDate === null ? null : updates.dueDate.toISOString(),
          tags: updates.tags,
        }),
      })
      if (!res.ok) throw new Error("Failed to update todo")
      return (await res.json()).data as UiTodo
    },
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<UiTodo[]>(queryKey, (old) => old?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)) ?? [])
    },
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete todo")
      return (await res.json()).data as UiTodo
    },
    onSuccess: (deleted) => {
      queryClient.setQueryData<UiTodo[]>(queryKey, (old) => old?.filter((t) => t.id !== deleted.id) ?? [])
    },
  })

  const reorder = (newOrder: UiTodo[]) => {
    queryClient.setQueryData<UiTodo[]>(queryKey, newOrder)
  }

  return { list, create, update, remove, reorder, queryKey }
}


