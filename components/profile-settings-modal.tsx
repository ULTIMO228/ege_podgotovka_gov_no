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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { useProfileContext } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

interface ProfileSettings {
  training_days: number[] | null
  study_goal_weekday: number | null
  study_goal_training: number | null
  study_goal_weekend: number | null
}

interface ProfileSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSettingsSaved?: () => void
}

export function ProfileSettingsModal({ open, onOpenChange, onSettingsSaved }: ProfileSettingsModalProps) {
  const { selectedProfile } = useProfileContext()
  const [settings, setSettings] = useState<ProfileSettings>({
    training_days: null,
    study_goal_weekday: null,
    study_goal_training: null,
    study_goal_weekend: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Дни недели для чекбоксов
  const weekDays = [
    { value: 0, label: "Воскресенье" },
    { value: 1, label: "Понедельник" },
    { value: 2, label: "Вторник" },
    { value: 3, label: "Среда" },
    { value: 4, label: "Четверг" },
    { value: 5, label: "Пятница" },
    { value: 6, label: "Суббота" },
  ]

  // Загружаем настройки профиля
  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedProfile || !open) return

      setIsLoading(true)
      try {
        const { data, error } = await getBrowserClient()
          .from("user_profiles")
          .select("training_days, study_goal_weekday, study_goal_training, study_goal_weekend")
          .eq("name", selectedProfile)
          .single()

        if (error) throw error

        setSettings({
          training_days: data.training_days || [],
          study_goal_weekday: data.study_goal_weekday || null,
          study_goal_training: data.study_goal_training || null,
          study_goal_weekend: data.study_goal_weekend || null,
        })
      } catch (error) {
        console.error("Error fetching profile settings:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки профиля",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [selectedProfile, open])

  // Обработчик изменения дней тренировок
  const handleTrainingDayChange = (day: number, checked: boolean) => {
    setSettings((prev) => {
      const trainingDays = prev.training_days || []
      if (checked) {
        return { ...prev, training_days: [...trainingDays, day].sort() }
      } else {
        return { ...prev, training_days: trainingDays.filter((d) => d !== day) }
      }
    })
  }

  // Обработчик сохранения настроек
  const handleSaveSettings = async () => {
    if (!selectedProfile) return

    setIsSaving(true)
    try {
      const { error } = await getBrowserClient()
        .from("user_profiles")
        .update({
          training_days: settings.training_days,
          study_goal_weekday: settings.study_goal_weekday,
          study_goal_training: settings.study_goal_training,
          study_goal_weekend: settings.study_goal_weekend,
        })
        .eq("name", selectedProfile)

      if (error) throw error

      toast({
        title: "Настройки сохранены",
        description: "Настройки профиля успешно обновлены",
      })

      if (onSettingsSaved) {
        onSettingsSaved()
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving profile settings:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки профиля",
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
          <DialogTitle>Настройки профиля</DialogTitle>
          <DialogDescription>
            Настройте дни тренировок и цели по времени обучения для профиля {selectedProfile}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Дни тренировок */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Дни тренировок</h3>
              <div className="grid grid-cols-1 gap-3">
                {weekDays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={(settings.training_days || []).includes(day.value)}
                      onCheckedChange={(checked) => handleTrainingDayChange(day.value, checked === true)}
                    />
                    <Label htmlFor={`day-${day.value}`} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Цели по времени обучения */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Цели по времени обучения (часов)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-weekday" className="text-sm">
                    Будний день
                  </Label>
                  <Input
                    id="goal-weekday"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={settings.study_goal_weekday || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        study_goal_weekday: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Например, 3"
                  />
                </div>

                {settings.training_days && settings.training_days.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="goal-training" className="text-sm">
                      День тренировки
                    </Label>
                    <Input
                      id="goal-training"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={settings.study_goal_training || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          study_goal_training: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="Например, 2"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="goal-weekend" className="text-sm">
                    Выходной день
                  </Label>
                  <Input
                    id="goal-weekend"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={settings.study_goal_weekend || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        study_goal_weekend: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Например, 5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading || isSaving}>
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
