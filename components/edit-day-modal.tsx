"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateDayInfo } from "@/app/actions"

const formSchema = z.object({
  day_type: z.enum(["weekend", "weekday", "training", "exam"]),
  comment: z.string().optional(),
  study_hours: z.coerce.number().min(0).max(24).optional(),
})

interface EditDayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  day: any
}

export function EditDayModal({ open, onOpenChange, day }: EditDayModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day_type: day.day_type,
      comment: day.comment || "",
      study_hours: day.study_hours || 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Подготовка данных для обновления
      const updates: any = {
        day_type: values.day_type,
      }

      if (values.comment !== undefined) {
        updates.comment = values.comment || null
      }

      if (values.study_hours !== undefined) {
        updates.study_hours = values.study_hours || null
      }

      await updateDayInfo(day.id, updates)

      toast({
        title: "День обновлен",
        description: "Информация о дне успешно обновлена",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирование дня</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="day_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип дня</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип дня" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekend">Выходной</SelectItem>
                      <SelectItem value="weekday">Будний день</SelectItem>
                      <SelectItem value="training">Тренировка</SelectItem>
                      <SelectItem value="exam">Экзамен</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Добавьте комментарий к дню" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="study_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Часы занятий</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="24" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
