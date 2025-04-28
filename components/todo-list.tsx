"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { addTodoItem, toggleTodoCompletion, deleteTodoItem } from "@/app/actions"
import { getBrowserClient } from "@/lib/supabase"
import type { TodoItem } from "@/types/database"

export function TodoList() {
  const router = useRouter()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingTodos, setPendingTodos] = useState<number[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data } = await getBrowserClient()
          .from("todo_items")
          .select("*")
          .order("created_at", { ascending: false })

        setTodos(data || [])
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить задачи",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()

    // Set up real-time subscription
    const subscription = getBrowserClient()
      .channel("todo_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todo_items",
        },
        (payload) => {
          fetchTodos()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTodoText.trim()) return

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("text", newTodoText)

      await addTodoItem(formData)

      // Обновляем локальное состояние
      const { data } = await getBrowserClient().from("todo_items").select("*").order("created_at", { ascending: false })

      setTodos(data || [])
      setNewTodoText("")

      toast({
        title: "Задача добавлена",
        description: "Новая задача успешно добавлена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить задачу",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTodo = async (todo: TodoItem) => {
    try {
      setPendingTodos((prev) => [...prev, todo.id])

      await toggleTodoCompletion(todo.id, !todo.is_completed)

      // Обновляем локальное состояние
      setTodos((prevTodos) => prevTodos.map((t) => (t.id === todo.id ? { ...t, is_completed: !todo.is_completed } : t)))

      // Show toast for completed todo
      if (!todo.is_completed) {
        toast({
          title: "Задача выполнена!",
          description: "+5 очков",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      })
    } finally {
      setPendingTodos((prev) => prev.filter((id) => id !== todo.id))
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      setPendingTodos((prev) => [...prev, id])

      await deleteTodoItem(id)

      // Обновляем локальное состояние
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))

      toast({
        title: "Задача удалена",
        description: "Задача успешно удалена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      })
    } finally {
      setPendingTodos((prev) => prev.filter((todoId) => todoId !== id))
    }
  }

  if (loading) {
    return <div className="text-center py-4">Загрузка задач...</div>
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input
          type="text"
          placeholder="Новая задача..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newTodoText.trim()}>
          Добавить
        </Button>
      </form>

      {todos.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">Нет дополнительных задач</div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-2 p-2 rounded-md ${
                todo.is_completed ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
            >
              <Checkbox
                id={`todo-${todo.id}`}
                checked={todo.is_completed}
                disabled={pendingTodos.includes(todo.id)}
                onCheckedChange={() => handleToggleTodo(todo)}
              />
              <label
                htmlFor={`todo-${todo.id}`}
                className={`flex-1 cursor-pointer ${todo.is_completed ? "line-through text-muted-foreground" : ""}`}
              >
                {todo.text}
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={pendingTodos.includes(todo.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
