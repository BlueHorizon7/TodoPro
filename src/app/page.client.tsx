"use client"

import { useEffect, useMemo, useState, useDeferredValue, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Check } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { SearchBar } from "@/components/global/SearchBar"
import { AddTodoForm } from "@/components/global/AddTodoForm"
import { QuickFilters } from "@/components/global/QuickFilters"
import { TodoCard } from "@/components/global/TodoCard"
import dynamic from "next/dynamic"
import { useUiStore, type Filter } from "@/store/ui"
import { useTodos, UiTodo } from "@/hooks/use-todos"
import { parseSearchQuery } from "@/lib/search-parser"

const EditTodoModal = dynamic(() => import("@/components/global/edit-todo-model").then((m) => m.EditTodoModal), {
  ssr: false,
})

export default function ClientPage({ initial }: { initial: UiTodo[] }) {
  const filter = useUiStore((s) => s.filter)
  const setFilter = useUiStore((s) => s.setFilter)
  const quickFilter = useUiStore((s) => s.quickFilter)
  const setQuickFilter = useUiStore((s) => s.setQuickFilter)
  const searchQuery = useUiStore((s) => s.searchQuery)
  const setSearchQuery = useUiStore((s) => s.setSearchQuery)
  const deferredSearch = useDeferredValue(searchQuery)

  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  const { list, create, update, remove, reorder } = useTodos({
    q: deferredSearch || undefined,
    completed: filter === "completed" ? true : filter === "active" ? false : undefined,
    important: quickFilter === "important" ? true : undefined,
  })

  // hydrate initial data to avoid blank state
  const todos = (list.data ?? initial) as UiTodo[]

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    text: string
    important: boolean
    dueDate?: Date
    tags: string[]
    createdAt: Date
  } | null>(null)

  const addTodo = useCallback((todoData: { text: string; important: boolean; dueDate?: Date; tags: string[] }) => {
    create.mutate(todoData)
  }, [create])

  const toggleTodo = useCallback((id: string) => {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    update.mutate({ id, updates: { completed: !target.completed } })
  }, [todos, update])

  const deleteTodo = useCallback((id: string) => {
    remove.mutate(id)
  }, [remove])

  const openEditModal = useCallback((id: string) => {
    const t = todos.find((x) => x.id === id)
    if (!t) return
    setEditing({
      id: t.id,
      text: t.text,
      important: t.important,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      tags: t.tags,
      createdAt: new Date(t.createdAt),
    })
    setIsEditModalOpen(true)
  }, [todos])

  const saveEditedTodo = (id: string, updates: { text?: string; important?: boolean; dueDate?: Date | null; tags?: string[] }) => {
    update.mutate({
      id,
      updates: {
        text: updates.text,
        important: updates.important,
        dueDate: updates.dueDate,
        tags: updates.tags,
      },
    })
    setIsEditModalOpen(false)
    setEditing(null)
  }

  const handleRename = (id: string, newText: string) => {
    update.mutate({
      id,
      updates: { text: newText },
    })
  }

  const toggleImportant = useCallback((id: string) => {
    const target = todos.find((t) => t.id === id)
    if (!target) return
    update.mutate({ id, updates: { important: !target.important } })
  }, [todos, update])

  const filteredTodos = useMemo(() => {
    let filtered = todos
    switch (quickFilter) {
      case "today": {
        filtered = filtered.filter((todo) => todo.dueDate && new Date(todo.dueDate).toDateString() === new Date().toDateString())
        break
      }
      case "due-soon": {
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
        filtered = filtered.filter((todo) => todo.dueDate && new Date(todo.dueDate) <= threeDaysFromNow && !todo.completed)
        break
      }
    }
    if (deferredSearch) {
      const query = deferredSearch.toLowerCase()
      filtered = filtered.filter((todo) => todo.text.toLowerCase().includes(query) || todo.tags.some((tag) => tag.toLowerCase().includes(query)))
    }
    return filtered
  }, [todos, quickFilter, deferredSearch])

  const filters = [
    { key: "all" as Filter, label: "All", count: todos.length },
    { key: "active" as Filter, label: "Active", count: todos.filter((t) => !t.completed).length },
    { key: "completed" as Filter, label: "Completed", count: todos.filter((t) => t.completed).length },
  ]

  return (
    <div className="min-h-screen premium-bg texture-overlay text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="border-r border-white/10 bg-black/40 backdrop-blur-sm">
          <SidebarHeader className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">TodoPro</h1>
                <p className="text-xs text-white/60">Professional Task Manager</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/60 px-3 mb-4">Filters</p>
              <SidebarMenu>
                {filters.map((filterItem) => (
                  <SidebarMenuItem key={filterItem.key}>
                    <SidebarMenuButton
                      onClick={() => setFilter(filterItem.key)}
                      isActive={filter === filterItem.key}
                      className="w-full justify-between hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                    >
                      <span>{filterItem.label}</span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full border border-white/10">
                        {filterItem.count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="flex-1 flex flex-col">
            <header className="border-b border-white/10 p-4 bg-black/5">
              <div className="flex justify-end items-center">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search todos, tags, due dates..." />
              </div>
            </header>

            <main className="flex-1 p-8 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-8">
                <AddTodoForm onAdd={addTodo} />
                <QuickFilters activeFilter={quickFilter} onFilterChange={setQuickFilter} />
                {deferredSearch && (
                  <div className="text-sm text-white/70 premium-card rounded-lg p-3">
                    Found {filteredTodos.length} todo{filteredTodos.length !== 1 ? "s" : ""} matching &quot;{deferredSearch}&quot;
                  </div>
                )}
                <div className="space-y-3">
                  {/* Virtualized list */}
                  <VirtualizedTodoList
                    items={filteredTodos}
                    renderItem={(todo) => (
                      <TodoCard
                        todo={{
                          id: todo.id,
                          text: todo.text,
                          completed: todo.completed,
                          important: todo.important,
                          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
                          tags: todo.tags,
                          createdAt: new Date(todo.createdAt),
                        }}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onEdit={openEditModal}
                        onToggleImportant={toggleImportant}
                        onRename={handleRename}
                      />
                    )}
                  />

                  {filteredTodos.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <Check className="w-10 h-10 text-white/50" />
                      </div>
                      <h3 className="text-xl font-semibold text-white/90 mb-2">{deferredSearch ? "No matching todos" : "No todos found"}</h3>
                      <p className="text-white/60 max-w-md mx-auto">
                        {deferredSearch
                          ? "Try adjusting your search or filters to find what you're looking for."
                          : filter === "all"
                            ? "Create your first todo to get started with your productivity journey."
                            : filter === "active"
                              ? "All caught up! No active todos at the moment."
                              : "No completed todos yet. Keep working on your tasks!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <EditTodoModal
        todo={editing as any}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditing(null)
        }}
        onSave={saveEditedTodo as any}
      />
    </div>
  )
}

function VirtualizedTodoList<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}) {
  const parentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // noop: just a stable ref
    }
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => document.querySelector('#todo-scroll-parent') as HTMLElement,
    estimateSize: () => 88,
    overscan: 6,
  })

  return (
    <div id="todo-scroll-parent" style={{ height: "60vh", overflow: "auto" }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const todo = items[virtualRow.index]
          return (
            <div
              key={todo.id}
              data-index={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(todo)}
            </div>
          )
        })}
      </div>
    </div>
  )
}


