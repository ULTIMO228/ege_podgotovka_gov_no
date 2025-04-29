"use client"

import { useState } from "react"
import { Check, Clock, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleTaskCompletion, deleteTask, updateTotalTasks } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import { EditTaskModal } from "@/components/edit-task-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProfile } from "@/context/ProfileContext"

interface TaskListProps {
  tasks: any[]
  dayId: number
  isEditing?: boolean
  onTasksChange?: () => void
}

export function TaskList({ tasks, dayId, isEditing = false, onTasksChange }: TaskListProps) {
  const { toast } = useToast()
  const { selectedProfile } = useProfile()
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет задач на этот день</p>
  }

  const handleToggleCompletion = async (taskId: number, isCompleted: boolean) => {
    try {
      await toggleTaskCompletion(taskId, !isCompleted)
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!deletingTaskId || !selectedProfile) return

    try {
      await deleteTask(deletingTaskId)
      await updateTotalTasks(selectedProfile, -1)
      toast({
        title: "Задача удалена",
        description: "Задача была успешно удалена из расписания",
      })
      if (onTasksChange) {
        onTasksChange()
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeletingTaskId(null)
    }
  }

  // Группировка задач по времени дня
  const tasksByTimeOfDay: Record<string, any[]> = {
    morning: [],
    afternoon: [],
  }

  tasks.forEach((task) => {
    if (task.time_of_day in tasksByTimeOfDay) {
      tasksByTimeOfDay[task.time_of_day].push(task)
    }
  })

  const timeOfDayLabels: Record<string, string> = {
    morning: "Утро",
    afternoon: "День/Вечер",
  }

  return (
    <div className="space-y-4">
      {Object.entries(tasksByTimeOfDay).map(
        ([timeOfDay, tasksForTime]) =>
          tasksForTime.length > 0 && (
            <div key={timeOfDay} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">{timeOfDayLabels[timeOfDay]}</h4>
              <ul className="space-y-2">
                {tasksForTime.map((task) => (
                  <li
                    key={task.id}
                    className={cn(
                      "flex items-start justify-between p-2 rounded-md",
                      task.is_completed
                        ? "bg-green-50 dark:bg-green-950"
                        : task.is_exam
                          ? "bg-red-50 dark:bg-red-950"
                          : "bg-gray-50 dark:bg-gray-900",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!isEditing && (
                        <Checkbox
                          checked={task.is_completed}
                          onCheckedChange={() => handleToggleCompletion(task.id, task.is_completed)}
                          className="mt-1"
                        />
                      )}
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            task.is_completed && "line-through text-muted-foreground",
                          )}
                        >
                          {task.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.duration && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {task.duration}
                            </Badge>
                          )}
                          {task.is_exam && (
                            <Badge variant="destructive" className="text-xs">
                              Экзамен
                            </Badge>
                          )}
                          {task.is_completed && (
                            <Badge variant="success" className="flex items-center gap-1 text-xs">
                              <Check className="h-3 w-3" />
                              Выполнено
                            </Badge>
                          )}
                          {task.score !== null && task.score !== undefined && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                              {task.score} баллов
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTask(task)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog
                          open={deletingTaskId === task.id}
                          onOpenChange={(open) => {
                            if (!open) setDeletingTaskId(null)
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => setDeletingTaskId(task.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удаление задачи</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить задачу "{task.description}"? Это действие нельзя
                                отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteTask}>Удалить</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ),
      )}

      {editingTask && (
        <EditTaskModal
          open={!!editingTask}
          onOpenChange={() => setEditingTask(null)}
          dayId={dayId}
          task={editingTask}
          onSuccess={onTasksChange}
        />
      )}
    </div>
  )
}
