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
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { useProfileContext } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

interface EditDayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayId: number | null
  onSuccess?: () => void
}

export function EditDayDialog({ open, onOpenChange, dayId, onSuccess }: EditDayDialogProps) {
  const { selectedProfile } = useProfileContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Состояние формы
  const [formData, setFormData] = useState({
    dayType: "weekday",
    comment: "",
    efficiency: 0,
    usefulness: 0,
    studyHours: "",
  })

  // Загружаем данные дня при открытии диалога
  useEffect(() => {
    if (!open || !selectedProfile || !dayId) return

    const fetchDayData = async () => {
      setIsLoading(true)
      try {
        const { data } = await getBrowserClient()
          .from("days")
          .select("*")
          .eq("id", dayId)
          .eq("user_profile_name", selectedProfile)
          .single()

        if (data) {
          setFormData({
            dayType: data.day_type || "weekday",
            comment: data.comment || "",
            efficiency: data.efficiency || 0,
            usefulness: data.usefulness || 0,
            studyHours: data.study_hours?.toString() || "",
          })
        }
      } catch (error) {
        console.error("Error fetching day data:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные дня",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDayData()
  }, [open, selectedProfile, dayId])

  // Обработчик сохранения изменений дня
  const handleSaveDay = async () => {
    if (!selectedProfile || !dayId) return

    setIsSaving(true)
    try {
      // Здесь будет вызов Server Action для обновления дня
      // const updates = {
      //   day_type: formData.dayType,
      //   comment: formData.comment,
      //   efficiency: formData.efficiency,
      //   usefulness: formData.usefulness,
      //   study_hours: formData.studyHours ? Number(formData.studyHours) : null
      // }

      // await updateDayInfo(selectedProfile, dayId, updates)

      toast({
        title: "День обновлен",
        description: "Информация о дне успешно обновлена",
      })

      if (onSuccess) {
        onSuccess()
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating day:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию о дне",
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
          <DialogTitle>Редактировать день</DialogTitle>
          <DialogDescription>Измените параметры дня в расписании</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Тип дня */}
            <div className="space-y-2">
              <Label htmlFor="dayType">Тип дня</Label>
              <Select
                value={formData.dayType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, dayType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekday">Будний</SelectItem>
                  <SelectItem value="weekend">Выходной</SelectItem>
                  <SelectItem value="training">Тренировка</SelectItem>
                  <SelectItem value="exam">Экзамен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Комментарий к дню"
                className="resize-none"
              />
            </div>

            {/* Эффективность */}
            <div className="space-y-2">
              <Label htmlFor="efficiency">Эффективность: {formData.efficiency}%</Label>
              <Slider
                id="efficiency"
                value={[formData.efficiency]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, efficiency: value[0] }))}
              />
            </div>

            {/* Польза */}
            <div className="space-y-2">
              <Label htmlFor="usefulness">Польза: {formData.usefulness}%</Label>
              <Slider
                id="usefulness"
                value={[formData.usefulness]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, usefulness: value[0] }))}
              />
            </div>

            {/* Часов занятий */}
            <div className="space-y-2">
              <Label htmlFor="studyHours">Часов занятий</Label>
              <Input
                id="studyHours"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.studyHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, studyHours: e.target.value }))}
                placeholder="Количество часов"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSaveDay} disabled={isLoading || isSaving}>
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
