"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { toggleTaskCompletion, updateTaskScore } from "@/app/actions"
import type { Task } from "@/types/database"

export function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const [pendingTasks, setPendingTasks] = useState<number[]>([])
  const [pendingScores, setPendingScores] = useState<number[]>([])

  const handleTaskToggle = async (task: Task) => {
    try {
      setPendingTasks((prev) => [...prev, task.id])

      await toggleTaskCompletion(task.id, !task.is_completed)

      // Show toast for completed task
      if (!task.is_completed) {
        toast({
          title: "Задача выполнена!",
          description: "+5 очков",
        })
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      })
    } finally {
      setPendingTasks((prev) => prev.filter((id) => id !== task.id))
    }
  }

  const handleScoreChange = async (task: Task, score: number) => {
    try {
      setPendingScores((prev) => [...prev, task.id])

      await updateTaskScore(task.id, score)

      toast({
        title: "Баллы обновлены",
        description: `Результат пробника: ${score} баллов`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить баллы",
        variant: "destructive",
      })
    } finally {
      setPendingScores((prev) => prev.filter((id) => id !== task.id))
    }
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`flex items-start gap-2 p-2 rounded-md ${task.is_completed ? "bg-muted/50" : "hover:bg-muted/30"}`}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.is_completed}
            disabled={pendingTasks.includes(task.id)}
            onCheckedChange={() => handleTaskToggle(task)}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={`text-sm cursor-pointer ${task.is_completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.description}
              {task.duration && <span className="ml-1 text-muted-foreground">– {task.duration}</span>}
            </label>

            {task.is_exam && (
              <div className="mt-1 flex items-center">
                <span className="text-xs text-muted-foreground mr-2">Баллы:</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={task.score || ""}
                  onChange={(e) => handleScoreChange(task, Number.parseInt(e.target.value))}
                  disabled={pendingScores.includes(task.id)}
                  className="h-7 w-16 text-xs"
                  placeholder="0-100"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
