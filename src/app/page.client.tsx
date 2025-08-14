"use client"

import { useEffect, useMemo, useState, useDeferredValue, useCallback, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Loader } from "@/components/ui/loader"
import { SearchBar } from "@/components/global/SearchBar"
import { AddTodoForm } from "@/components/global/AddTodoForm"
import { QuickFilters } from "@/components/global/QuickFilters"
import { TodoCard } from "@/components/global/TodoCard"
import { SidebarFooter } from "@/components/global/SidebarFooter"
import dynamic from "next/dynamic"
import { useUiStore, type Filter } from "@/store/ui"
import { useTodos, UiTodo } from "@/hooks/use-todos"
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

const EditTodoModal = dynamic(() => import("@/components/global/edit-todo-model").then((m) => m.EditTodoModal), {
  ssr: false,
})

export default function ClientPage({ initial }: { initial: UiTodo[] }) {
  const filter = useUiStore((s) => s.filter)
  const setFilter = useUiStore((s) => s.setFilter)
  const quickFilter = useUiStore((s) => s.quickFilter)
  const setQuickFilter = useUiStore((s) => s.setQuickFilter)
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""))
  const [, setCompletedParam] = useQueryState("completed", parseAsBoolean)
  const deferredSearch = useDeferredValue(searchQuery)

  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  // Convert quick filters to search queries
  const getSearchQuery = () => {
    let searchQuery = deferredSearch || ""
    
    // Add quick filter search terms
    if (quickFilter === "today") {
      searchQuery = searchQuery ? `${searchQuery} /date:today` : "/date:today"
    } else if (quickFilter === "due-soon") {
      searchQuery = searchQuery ? `${searchQuery} /date:due-soon` : "/date:due-soon"
    } else if (quickFilter === "important") {
      searchQuery = searchQuery ? `${searchQuery} @important:true` : "@important:true"
    }
    
    return searchQuery || undefined
  }

  const { list, create, update, remove } = useTodos({
    q: getSearchQuery(),
    completed: filter === "completed" ? true : filter === "active" ? false : undefined,
    important: undefined,
  })

  // hydrate initial data to avoid blank state
  const todos = (list.data ?? initial) as UiTodo[]

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editing, setEditing] = useState<{
    id: string
    text: string
    completed: boolean
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
      completed: t.completed,
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
    // Server-side search is already handled by the API
    // Only apply client-side quick filters that aren't handled by the server
    const filtered = todos
    
    // Apply quick filters that aren't handled by the server
    switch (quickFilter) {
      case "today": {
        // This is now handled by the server search with /date:today
        break
      }
      case "due-soon": {
        // This is now handled by the server search with /date:due-soon
        break
      }
    }
    
    return filtered
  }, [todos, quickFilter])

  const viewTodos = useMemo(() => {
    return filteredTodos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      important: todo.important,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      tags: Array.isArray(todo.tags) ? todo.tags : [],
      createdAt: new Date(todo.createdAt),
    }))
  }, [filteredTodos])

  const filters = [
    { key: "all" as Filter, label: "All", count: todos.length },
    { key: "active" as Filter, label: "Active", count: todos.filter((t) => !t.completed).length },
    { key: "completed" as Filter, label: "Completed", count: todos.filter((t) => t.completed).length },
  ]

  // Keep URL param in sync with sidebar filter selection, and trigger query refetch via key
  useEffect(() => {
    if (filter === "active") setCompletedParam(false)
    else if (filter === "completed") setCompletedParam(true)
    else setCompletedParam(null)
  }, [filter, setCompletedParam])

  return (
    <div className="min-h-screen premium-bg texture-overlay text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="border-r border-white/10 bg-black/40 backdrop-blur-sm">
          <SidebarHeader className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <Image src="/logo.svg" alt="TodoPro Logo" width={20} height={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">TodoPro</h1>
                <p className="text-xs text-white/60">Professional Task Manager</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-6 flex flex-col h-full">
            <div className="space-y-2 flex-1">
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
            
            <div className="mt-auto pt-6">
              <SidebarFooter />
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="flex-1 flex flex-col">
            <header className="border-b border-white/10 p-3 sm:p-4 bg-black/5">
            <div className="flex items-center gap-3">
                <div className="md:hidden">
                  <SidebarTrigger className="text-white/80" />
                </div>
              <div className="flex-1 flex justify-end md:justify-end">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search todos, tags, due dates..." />
                </div>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-white/20 to-white/10 border border-white/20 hover:from-white/30 hover:to-white/20 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{ 
                    elements: { 
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonTrigger: "hover:bg-white/10 transition-colors duration-200",
                      userButtonPopoverCard: "bg-black/90 border border-white/20",
                      userButtonPopoverActionButton: "text-white hover:bg-white/10",
                      userButtonPopoverActionButtonText: "text-white",
                      userButtonPopoverFooter: "border-t border-white/20",
                      userButtonPopoverFooterAction: "text-white hover:bg-white/10"
                    },
                    variables: {
                      colorPrimary: "rgb(255 255 255 / 0.2)",
                      colorBackground: "rgb(0 0 0 / 0.8)",
                      colorText: "rgb(255 255 255 / 0.9)",
                      colorTextSecondary: "rgb(255 255 255 / 0.7)",
                      colorNeutral: "rgb(255 255 255 / 0.9)",
                      colorInputForeground: "rgb(0 0 0 / 0.9)"
                    }
                  }} 
                />
              </SignedIn>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
              <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
                <SignedIn>
                  <AddTodoForm onAdd={addTodo} />
                </SignedIn>
                <SignedOut>
                  <div className="premium-card rounded-lg p-6 text-center border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                      <Image src="/logo.svg" alt="TodoPro Logo" width={32} height={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-white/90 mb-2">Welcome to TodoPro</h3>
                    <p className="text-white/70 mb-4">Sign in to create and manage your personal todos.</p>
                    <SignInButton mode="modal">
                      <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-white/20 to-white/10 border border-white/20 hover:from-white/30 hover:to-white/20 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm font-medium">
                        Get Started
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
                <QuickFilters activeFilter={quickFilter} onFilterChange={setQuickFilter} />
                {list.isLoading && (
                  <div className="flex justify-center py-8">
                    <Loader text="Loading todos..." />
                  </div>
                )}
                {deferredSearch && (
                  <div className="text-sm text-white/70 premium-card rounded-lg p-3">
                    Found {filteredTodos.length} todo{filteredTodos.length !== 1 ? "s" : ""} matching &quot;{deferredSearch}&quot;
                  </div>
                )}
                <div className="space-y-3">
                  {/* Virtualized list */}
                  <VirtualizedTodoList
                    items={viewTodos}
                    renderItem={(todo) => (
                      <TodoCard
                        todo={todo}
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
                        <Image src="/logo.svg" alt="TodoPro Logo" width={40} height={40} />
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
        todo={editing}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditing(null)
        }}
        onSave={saveEditedTodo}
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
  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current as HTMLElement,
    estimateSize: () => 100, // base guess (actual height measured below)
    measureElement: (el) => el?.getBoundingClientRect().height || 100,
    overscan: 8,
  })

  return (
    <div id="todo-scroll-parent" ref={parentRef} style={{ height: "60vh", overflow: "auto" }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const todo = items[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingTop: 8,
                paddingBottom: 8,
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


