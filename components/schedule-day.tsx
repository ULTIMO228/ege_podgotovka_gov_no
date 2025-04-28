"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskList } from "@/components/task-list"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { updateDayInfo } from "@/app/actions"
import type { Day, Task } from "@/types/database"

interface ScheduleDayProps {
  day: Day
  tasks: Task[]
}

export function ScheduleDay({ day, tasks }: ScheduleDayProps) {
  const [comment, setComment] = useState(day.comment || "")
  const [efficiency, setEfficiency] = useState(day.efficiency || 0)
  const [usefulness, setUsefulness] = useState(day.usefulness || 0)
  const [studyHours, setStudyHours] = useState(day.study_hours?.toString() || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Group tasks by time of day
  const morningTasks = tasks.filter((task) => task.time_of_day === "morning") || []
  const afternoonTasks = tasks.filter((task) => task.time_of_day === "afternoon") || []

  // Format date
  const date = new Date(day.date)
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")} ${day.day_name}`

  // Check if this is today
  const isToday = day.date === new Date().toISOString().split("T")[0]

  // Get badge variant based on day type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "weekend":
        return "secondary"
      case "weekday":
        return "default"
      case "training":
        return "warning"
      case "exam":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get day type text
  const getDayTypeText = (type: string) => {
    switch (type) {
      case "weekend":
        return "Выходной"
      case "weekday":
        return "Будний"
      case "training":
        return "Тренировка"
      case "exam":
        return "Экзамен"
      default:
        return type
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const updates = {
        comment,
        efficiency,
        usefulness,
        study_hours: studyHours ? Number.parseFloat(studyHours) : null,
      }

      await updateDayInfo(day.id, updates)

      setIsEditing(false)
      toast({
        title: "Сохранено",
        description: "Информация о дне успешно обновлена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить информацию",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={isToday ? "border-primary" : ""}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">{formattedDate}</span>
          {isToday && <Badge variant="outline">Сегодня</Badge>}
        </div>
        <Badge variant={getBadgeVariant(day.day_type)}>{getDayTypeText(day.day_type)}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Утро</h3>
            {morningTasks.length > 0 ? (
              <TaskList tasks={morningTasks} />
            ) : (
              <p className="text-sm text-muted-foreground">Нет задач</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Днём</h3>
            {afternoonTasks.length > 0 ? (
              <TaskList tasks={afternoonTasks} />
            ) : (
              <p className="text-sm text-muted-foreground">Нет задач</p>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="mt-4 space-y-3">
            {(day.comment || day.efficiency || day.usefulness || day.study_hours) && (
              <>
                {day.comment && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Комментарий:</h4>
                    <p className="text-sm bg-muted/50 p-2 rounded">{day.comment}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {day.efficiency !== null && day.efficiency !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Эффективность:</h4>
                      <p className="text-sm">{day.efficiency}%</p>
                    </div>
                  )}

                  {day.usefulness !== null && day.usefulness !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Польза:</h4>
                      <p className="text-sm">{day.usefulness}%</p>
                    </div>
                  )}

                  {day.study_hours && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Часов занятий:</h4>
                      <p className="text-sm">{day.study_hours}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {day.comment || day.efficiency || day.usefulness || day.study_hours
                ? "Редактировать"
                : "Добавить информацию о дне"}
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor={`comment-${day.id}`} className="text-sm font-medium block mb-1">
                Комментарий:
              </label>
              <Textarea
                id={`comment-${day.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ваш комментарий о дне..."
                className="resize-none"
              />
            </div>

            <div>
              <label htmlFor={`efficiency-${day.id}`} className="text-sm font-medium block mb-1">
                Эффективность: {efficiency}%
              </label>
              <Slider
                id={`efficiency-${day.id}`}
                value={[efficiency]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setEfficiency(value[0])}
              />
            </div>

            <div>
              <label htmlFor={`usefulness-${day.id}`} className="text-sm font-medium block mb-1">
                Польза: {usefulness}%
              </label>
              <Slider
                id={`usefulness-${day.id}`}
                value={[usefulness]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setUsefulness(value[0])}
              />
            </div>

            <div>
              <label htmlFor={`study-hours-${day.id}`} className="text-sm font-medium block mb-1">
                Часов занятий:
              </label>
              <Input
                id={`study-hours-${day.id}`}
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
                placeholder="Количество часов"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
