"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { useProfileContext } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayId: number | null
  taskId: number | null
  onSuccess?: () => void
}

export function AddTaskDialog({ open, onOpenChange, dayId, taskId, onSuccess }: AddTaskDialogProps) {
  const { selectedProfile } = useProfileContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [activityTypes, setActivityTypes] = useState<any[]>([])

  // Состояние формы
  const [formData, setFormData] = useState({
    subject: "",
    activityType: "",
    description: "",
    duration: "1",
    timeOfDay: "morning",
    isExam: false,
    templateId: null as number | null,
  })

  // Загружаем данные при открытии диалога
  useEffect(() => {
    if (!open || !selectedProfile) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Загружаем профиль для получения предметов
        const { data: profileData } = await getBrowserClient()
          .from("user_profiles")
          .select("subjects")
          .eq("name", selectedProfile)
          .single()

        if (profileData?.subjects) {
          setSubjects(profileData.subjects)
        }

        // Загружаем шаблоны активностей
        const { data: templatesData } = await getBrowserClient()
          .from("activity_templates")
          .select("*")
          .order("subject_key", { ascending: true })
          .order("activity_key", { ascending: true })

        if (templatesData) {
          setTemplates(templatesData)
        }

        // Если редактируем существующую задачу
        if (taskId) {
          const { data: taskData } = await getBrowserClient().from("tasks").select("*").eq("id", taskId).single()

          if (taskData) {
            // Заполняем форму данными задачи
            setFormData({
              subject: taskData.subject_key || "",
              activityType: taskData.activity_key || "",
              description: taskData.description || "",
              duration: taskData.duration?.toString() || "1",
              timeOfDay: taskData.time_of_day || "morning",
              isExam: taskData.is_exam || false,
              templateId: taskData.activity_template_id,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [open, selectedProfile, taskId])

  // Обновляем список типов активностей при изменении предмета
  useEffect(() => {
    if (formData.subject) {
      const filteredActivities = templates.filter((t) => t.subject_key === formData.subject)
      setActivityTypes(filteredActivities)
    } else {
      setActivityTypes([])
    }
  }, [formData.subject, templates])

  // Обработчик изменения шаблона активности
  const handleActivityTemplateChange = (templateId: string) => {
    if (templateId === "custom") {
      setFormData((prev) => ({
        ...prev,
        activityType: "custom",
        description: "",
        duration: "1",
        templateId: null,
      }))
      return
    }

    const template = templates.find((t) => t.id.toString() === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        activityType: template.activity_key,
        description: template.description,
        duration: template.default_duration.toString(),
        templateId: template.id,
      }))
    }
  }

  // Обработчик сохранения задачи
  const handleSaveTask = async () => {
    if (!selectedProfile || !dayId) return

    setIsSaving(true)
    try {
      // Здесь будет вызов Server Action для сохранения задачи
      // const taskData = {
      //   day_id: dayId,
      //   description: formData.description,
      //   duration: formData.duration,
      //   time_of_day: formData.timeOfDay,
      //   is_exam: formData.isExam,
      //   activity_template_id: formData.templateId,
      //   user_profile_name: selectedProfile
      // }

      // if (taskId) {
      //   await updateTask(selectedProfile, taskId, taskData)
      // } else {
      //   await addTask(selectedProfile, taskData)
      // }

      toast({
        title: taskId ? "Задача обновлена" : "Задача добавлена",
        description: taskId ? "Задача успешно обновлена" : "Задача успешно добавлена в расписание",
      })

      if (onSuccess) {
        onSuccess()
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving task:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить задачу",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{taskId ? "Редактировать задачу" : "Добавить задачу"}</DialogTitle>
          <DialogDescription>
            {taskId ? "Измените параметры задачи" : "Добавьте новую задачу в расписание"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Выбор предмета */}
            <div className="space-y-2">
              <Label htmlFor="subject">Предмет</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "rus"
                        ? "Русский язык"
                        : subject === "math_prof"
                          ? "Математика (профиль)"
                          : subject === "inf"
                            ? "Информатика"
                            : subject === "phys"
                              ? "Физика"
                              : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Выбор типа активности */}
            <div className="space-y-2">
              <Label htmlFor="activityType">Тип активности</Label>
              <Select
                value={formData.templateId ? formData.templateId.toString() : "custom"}
                onValueChange={handleActivityTemplateChange}
                disabled={!formData.subject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип активности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">-- Своё описание --</SelectItem>
                  {activityTypes.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id.toString()}>
                      {activity.activity_key === "nareshka"
                        ? "Нарешка"
                        : activity.activity_key === "hardprog"
                          ? "Сложное программирование"
                          : activity.activity_key === "part1_probnik"
                            ? "Пробник (часть 1)"
                            : activity.activity_key === "part2_probnik"
                              ? "Пробник (часть 2)"
                              : activity.activity_key === "full_probnik"
                                ? "Полный пробник"
                                : activity.activity_key === "sochinenie"
                                  ? "Сочинение"
                                  : activity.activity_key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Введите описание задачи"
                className="resize-none"
              />
            </div>

            {/* Длительность */}
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (часов)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            {/* Время дня */}
            <div className="space-y-2">
              <Label htmlFor="timeOfDay">Время дня</Label>
              <Select
                value={formData.timeOfDay}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, timeOfDay: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Утро</SelectItem>
                  <SelectItem value="afternoon">Днём</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Это экзамен? */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isExam"
                checked={formData.isExam}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isExam: checked === true }))}
              />
              <Label htmlFor="isExam">Это экзамен</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSaveTask} disabled={isLoading || isSaving || !formData.description}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
