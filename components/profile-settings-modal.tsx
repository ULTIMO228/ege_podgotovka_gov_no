"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { updateProfileSettings } from "@/app/actions"
import { useProfile } from "@/context/ProfileContext"

const formSchema = z.object({
  training_days: z.array(z.number()),
  study_goal_weekday: z.coerce.number().min(0).max(24).optional(),
  study_goal_training: z.coerce.number().min(0).max(24).optional(),
  study_goal_weekend: z.coerce.number().min(0).max(24).optional(),
})

interface ProfileSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { toast } = useToast()
  const { selectedProfile } = useProfile()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      training_days: [],
      study_goal_weekday: 0,
      study_goal_training: 0,
      study_goal_weekend: 0,
    },
  })

  // Загрузка текущих настроек профиля
  useEffect(() => {
    async function loadProfileSettings() {
      if (!selectedProfile || !open) return

      try {
        setLoading(true)
        const supabase = getBrowserClient()

        const { data, error } = await supabase.from("user_profiles").select("*").eq("name", selectedProfile).single()

        if (error) throw error

        if (data) {
          form.reset({
            training_days: data.training_days || [],
            study_goal_weekday: data.study_goal_weekday || 0,
            study_goal_training: data.study_goal_training || 0,
            study_goal_weekend: data.study_goal_weekend || 0,
          })
        }
      } catch (error) {
        console.error("Error loading profile settings:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки профиля",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfileSettings()
  }, [selectedProfile, open, form, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedProfile) return

    try {
      setIsSubmitting(true)

      await updateProfileSettings(selectedProfile, {
        training_days: values.training_days,
        study_goal_weekday: values.study_goal_weekday,
        study_goal_training: values.study_goal_training,
        study_goal_weekend: values.study_goal_weekend,
      })

      toast({
        title: "Настройки сохранены",
        description: "Настройки профиля успешно обновлены",
      })

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

  const weekdays = [
    { id: 0, label: "Воскресенье" },
    { id: 1, label: "Понедельник" },
    { id: 2, label: "Вторник" },
    { id: 3, label: "Среда" },
    { id: 4, label: "Четверг" },
    { id: 5, label: "Пятница" },
    { id: 6, label: "Суббота" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-4">Загрузка настроек...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="training_days"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Дни тренировок</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Выберите дни недели, которые будут отмечены как тренировочные
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {weekdays.map((day) => (
                        <FormField
                          key={day.id}
                          control={form.control}
                          name="training_days"
                          render={({ field }) => {
                            return (
                              <FormItem key={day.id} className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.id])
                                        : field.onChange(field.value?.filter((value) => value !== day.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{day.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="study_goal_weekday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цель (будни)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="24" step="0.5" placeholder="Часов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="study_goal_training"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цель (тренировки)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="24" step="0.5" placeholder="Часов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="study_goal_weekend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цель (выходные)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="24" step="0.5" placeholder="Часов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
