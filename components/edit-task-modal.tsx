"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { addTask, updateTask, updateTotalTasks } from "@/app/actions"
import { useProfile } from "@/context/ProfileContext"

const formSchema = z.object({
  subject_key: z.string().min(1, "Выберите предмет"),
  activity_key: z.string().min(1, "Выберите тип активности"),
  description: z.string().min(1, "Введите описание задачи"),
  duration: z.string().min(1, "Введите продолжительность"),
  time_of_day: z.enum(["morning", "afternoon"]),
  is_exam: z.boolean().default(false),
  activity_template_id: z.number().optional(),
})

interface EditTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayId: number
  task?: any
  onSuccess?: () => void
}

export function EditTaskModal({ open, onOpenChange, dayId, task, onSuccess }: EditTaskModalProps) {
  const { toast } = useToast()
  const { selectedProfile } = useProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [activityTemplates, setActivityTemplates] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])
  const isEditing = !!task

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_key: task?.subject_key || "",
      activity_key: task?.activity_key || "",
      description: task?.description || "",
      duration: task?.duration || "",
      time_of_day: task?.time_of_day || "afternoon",
      is_exam: task?.is_exam || false,
      activity_template_id: task?.activity_template_id || undefined,
    },
  })

  const watchSubject = form.watch("subject_key")

  // Загрузка предметов и шаблонов активностей
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getBrowserClient()

        // Получаем список предметов из профиля пользователя
        if (selectedProfile) {
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("subjects")
            .eq("name", selectedProfile)
            .single()

          if (profileError) throw profileError

          if (profileData?.subjects) {
            setSubjects(profileData.subjects)
          }
        }

        // Получаем шаблоны активностей
        const { data: templatesData, error: templatesError } = await supabase.from("activity_templates").select("*")

        if (templatesError) throw templatesError

        setActivityTemplates(templatesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [selectedProfile])

  // Фильтрация активностей по выбранному предмету
  useEffect(() => {
    if (watchSubject) {
      const filtered = activityTemplates.filter((template) => template.subject_key === watchSubject)
      setFilteredActivities(filtered)

      // Если выбранная активность не соответствует предмету, сбрасываем её
      const currentActivity = form.getValues("activity_key")
      const activityExists = filtered.some((a) => a.activity_key === currentActivity)

      if (currentActivity && !activityExists) {
        form.setValue("activity_key", "")
        form.setValue("activity_template_id", undefined)
      }
    } else {
      setFilteredActivities([])
    }
  }, [watchSubject, activityTemplates, form])

  // Обработка выбора активности
  const handleActivityChange = (value: string) => {
    form.setValue("activity_key", value)

    // Находим шаблон активности и устанавливаем его ID и описание
    const template = activityTemplates.find((t) => t.subject_key === watchSubject && t.activity_key === value)

    if (template) {
      form.setValue("activity_template_id", template.id)
      form.setValue("description", template.description)

      if (template.default_duration) {
        form.setValue("duration", String(template.default_duration) + " ч")
      }
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedProfile) {
      toast({
        title: "Ошибка",
        description: "Профиль не выбран",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (isEditing) {
        // Обновление существующей задачи
        await updateTask(task.id, {
          subject_key: values.subject_key,
          activity_key: values.activity_key,
          description: values.description,
          duration: values.duration,
          time_of_day: values.time_of_day,
          is_exam: values.is_exam,
          activity_template_id: values.activity_template_id,
        })

        toast({
          title: "Задача обновлена",
          description: "Задача успешно обновлена",
        })
      } else {
        // Добавление новой задачи
        await addTask(selectedProfile, dayId, {
          subject_key: values.subject_key,
          activity_key: values.activity_key,
          description: values.description,
          duration: values.duration,
          time_of_day: values.time_of_day,
          is_exam: values.is_exam,
          activity_template_id: values.activity_template_id,
        })

        // Обновляем общее количество задач
        await updateTotalTasks(selectedProfile, 1)

        toast({
          title: "Задача добавлена",
          description: "Новая задача успешно добавлена",
        })
      }

      if (onSuccess) {
        onSuccess()
      }

      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Редактирование задачи" : "Добавление задачи"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Предмет</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject === "math"
                            ? "Математика"
                            : subject === "russian"
                              ? "Русский язык"
                              : subject === "informatics"
                                ? "Информатика"
                                : subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип активности</FormLabel>
                  <Select onValueChange={handleActivityChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип активности" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredActivities.map((activity) => (
                        <SelectItem key={activity.activity_key} value={activity.activity_key}>
                          {activity.activity_key === "practice"
                            ? "Практика"
                            : activity.activity_key === "theory"
                              ? "Теория"
                              : activity.activity_key === "exam"
                                ? "Пробный экзамен"
                                : activity.activity_key === "essay"
                                  ? "Сочинение"
                                  : activity.activity_key === "programming"
                                    ? "Программирование"
                                    : activity.activity_key === "algorithms"
                                      ? "Алгоритмы"
                                      : activity.activity_key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите описание задачи" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Продолжительность</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: 2 ч" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_of_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Время дня</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время дня" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Утро</SelectItem>
                      <SelectItem value="afternoon">День/Вечер</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_exam"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Экзамен</FormLabel>
                    <p className="text-sm text-muted-foreground">Отметьте, если это пробный экзамен</p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : isEditing ? "Обновить" : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
