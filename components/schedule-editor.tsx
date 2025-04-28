"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Edit, Save, X, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useProfileContext } from "@/components/auth-provider"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditDayDialog } from "@/components/edit-day-dialog"
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

interface ScheduleEditorProps {
  hasSchedule: boolean
}

export function ScheduleEditor({ hasSchedule }: ScheduleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isEditDayDialogOpen, setIsEditDayDialogOpen] = useState(false)
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const router = useRouter()
  const { selectedProfile } = useProfileContext()

  // Обработчик создания расписания
  const handleCreateSchedule = async () => {
    if (!selectedProfile) return

    try {
      // Здесь будет вызов Server Action для создания расписания
      // await createScheduleForProfile(selectedProfile)

      toast({
        title: "Расписание создано",
        description: "Базовое расписание успешно создано. Теперь вы можете добавить задачи.",
      })

      // Обновляем страницу и включаем режим редактирования
      router.refresh()
      setIsEditing(true)
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать расписание",
        variant: "destructive",
      })
    }
  }

  // Обработчик добавления задачи
  const handleAddTask = (dayId: number) => {
    setSelectedDayId(dayId)
    setIsAddTaskDialogOpen(true)
  }

  // Обработчик редактирования задачи
  const handleEditTask = (taskId: number) => {
    setSelectedTaskId(taskId)
    setIsAddTaskDialogOpen(true)
  }

  // Обработчик редактирования дня
  const handleEditDay = (dayId: number) => {
    setSelectedDayId(dayId)
    setIsEditDayDialogOpen(true)
  }

  // Обработчик удаления задачи
  const handleDeleteTask = async (taskId: number) => {
    if (!selectedProfile) return

    try {
      // Здесь будет вызов Server Action для удаления задачи
      // await deleteTask(selectedProfile, taskId)

      toast({
        title: "Задача удалена",
        description: "Задача успешно удалена из расписания",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      })
    }
  }

  // Если у профиля нет расписания, показываем кнопку создания
  if (!hasSchedule) {
    return (
      <Button onClick={handleCreateSchedule}>
        <Plus className="mr-2 h-4 w-4" />
        Создать расписание
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center"
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Выйти из режима редактирования
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать расписание
            </>
          )}
        </Button>

        {isEditing && (
          <Button onClick={() => setIsEditing(false)}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить изменения
          </Button>
        )}
      </div>

      {/* Передаем режим редактирования в дочерние компоненты */}
      {/* Здесь будет код для передачи isEditing, handleAddTask, handleEditTask, handleEditDay, handleDeleteTask в ScheduleWeek и ScheduleDay */}

      {/* Диалог добавления/редактирования задачи */}
      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        dayId={selectedDayId}
        taskId={selectedTaskId}
        onSuccess={() => {
          setSelectedDayId(null)
          setSelectedTaskId(null)
          router.refresh()
        }}
      />

      {/* Диалог редактирования дня */}
      <EditDayDialog
        open={isEditDayDialogOpen}
        onOpenChange={setIsEditDayDialogOpen}
        dayId={selectedDayId}
        onSuccess={() => {
          setSelectedDayId(null)
          router.refresh()
        }}
      />

      {/* Компонент для удаления задачи с подтверждением */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {/* Этот триггер будет вызываться программно */}
          <span className="hidden" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Задача будет удалена из расписания.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedTaskId && handleDeleteTask(selectedTaskId)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
