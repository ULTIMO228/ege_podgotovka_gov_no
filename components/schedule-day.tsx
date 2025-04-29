"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { getBrowserClient } from "@/lib/supabase"
import { TaskList } from "@/components/task-list"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Calendar, Target } from "lucide-react"
import { EditDayModal } from "@/components/edit-day-modal"
import { EditTaskModal } from "@/components/edit-task-modal"
import { useProfile } from "@/context/ProfileContext"

interface ScheduleDayProps {
  day: {
    id: number
    date: string
    day_name: string
    day_type: "weekend" | "weekday" | "training" | "exam"
    comment?: string
    efficiency?: number
    usefulness?: number
    study_hours?: number
  }
  isEditing?: boolean
}

export function ScheduleDay({ day, isEditing = false }: ScheduleDayProps) {
  const { selectedProfile } = useProfile()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDayOpen, setEditDayOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [profileSettings, setProfileSettings] = useState<any>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const dayTypeLabels: Record<string, string> = {
    weekend: "Выходной",
    weekday: "Будний день",
    training: "Тренировка",
    exam: "Экзамен",
  }

  const dayTypeColors: Record<string, string> = {
    weekend: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    weekday: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    training: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  useEffect(() => {
    async function fetchTasks() {
      if (!selectedProfile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = getBrowserClient()

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("day_id", day.id)
          .eq("user_profile_name", selectedProfile)
          .order("time_of_day", { ascending: true })

        if (error) {
          throw error
        }

        setTasks(data || [])
      } catch (err: any) {
        console.error("Error fetching tasks:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [day.id, selectedProfile])

  // Загрузка настроек профиля для отображения целей
  useEffect(() => {
    async function fetchProfileSettings() {
      if (!selectedProfile) {
        setLoadingSettings(false)
        return
      }

      try {
        setLoadingSettings(true)
        const supabase = getBrowserClient()

        const { data, error } = await supabase
          .from("user_profiles")
          .select("study_goal_weekday, study_goal_training, study_goal_weekend")
          .eq("name", selectedProfile)
          .single()

        if (error) {
          throw error
        }

        setProfileSettings(data)
      } catch (err: any) {
        console.error("Error fetching profile settings:", err)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchProfileSettings()
  }, [selectedProfile])

  const refreshTasks = async () => {
    if (!selectedProfile) return

    try {
      setLoading(true)
      const supabase = getBrowserClient()

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("day_id", day.id)
        .eq("user_profile_name", selectedProfile)
        .order("time_of_day", { ascending: true })

      if (error) {
        throw error
      }

      setTasks(data || [])
    } catch (err: any) {
      console.error("Error refreshing tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = format(new Date(day.date), "d MMMM yyyy", { locale: ru })

  // Определение цели в зависимости от типа дня
  const getStudyGoal = () => {
    if (!profileSettings) return null

    switch (day.day_type) {
      case "weekday":
        return profileSettings.study_goal_weekday
      case "training":
        return profileSettings.study_goal_training
      case "weekend":
        return profileSettings.study_goal_weekend
      case "exam":
        return null // Для экзаменов нет цели
      default:
        return null
    }
  }

  const studyGoal = getStudyGoal()

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {day.day_name}, {formattedDate}
                {isEditing && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditDayOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge className={dayTypeColors[day.day_type]}>{dayTypeLabels[day.day_type]}</Badge>
                {day.study_hours !== null && day.study_hours !== undefined && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {day.study_hours} ч
                    {studyGoal !== null && (
                      <span className="ml-1 text-xs">
                        / <Target className="inline h-3 w-3" /> {studyGoal} ч
                      </span>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {day.comment && <p className="text-sm text-muted-foreground mt-2">{day.comment}</p>}
        </CardHeader>
        <CardContent className="flex-grow">
          {loading ? (
            <Skeleton className="h-[100px] w-full" />
          ) : (
            <TaskList tasks={tasks} dayId={day.id} isEditing={isEditing} onTasksChange={refreshTasks} />
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full" onClick={() => setAddTaskOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить задачу
            </Button>
          </CardFooter>
        )}
      </Card>

      <EditDayModal open={editDayOpen} onOpenChange={setEditDayOpen} day={day} />

      <EditTaskModal open={addTaskOpen} onOpenChange={setAddTaskOpen} dayId={day.id} onSuccess={refreshTasks} />
    </>
  )
}
