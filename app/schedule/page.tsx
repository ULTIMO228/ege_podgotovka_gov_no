"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"
import { ScheduleFilter } from "@/components/schedule-filter"
import { ScheduleWeek } from "@/components/schedule-week"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/context/ProfileContext"
import { createScheduleForProfile } from "@/app/actions"

export default function SchedulePage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = searchParams.filter || "all"
  const { selectedProfile } = useProfile()
  const router = useRouter()

  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)

  useEffect(() => {
    async function fetchWeeks() {
      if (!selectedProfile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = getBrowserClient()

        const { data, error } = await supabase
          .from("weeks")
          .select("*")
          .eq("user_profile_name", selectedProfile)
          .order("start_date", { ascending: true })

        if (error) {
          throw error
        }

        setWeeks(data || [])
      } catch (err: any) {
        console.error("Error fetching weeks:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeks()
  }, [selectedProfile])

  const handleCreateSchedule = async () => {
    if (!selectedProfile) return

    try {
      setIsCreatingSchedule(true)
      await createScheduleForProfile(selectedProfile)
      router.refresh()
      // Перезагрузим данные
      const supabase = getBrowserClient()
      const { data } = await supabase
        .from("weeks")
        .select("*")
        .eq("user_profile_name", selectedProfile)
        .order("start_date", { ascending: true })

      setWeeks(data || [])
      setIsEditing(true) // Автоматически включаем режим редактирования
    } catch (err: any) {
      console.error("Error creating schedule:", err)
      setError(err.message)
    } finally {
      setIsCreatingSchedule(false)
    }
  }

  if (!selectedProfile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
          <ScheduleFilter currentFilter={filter} />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не выбран</AlertTitle>
          <AlertDescription>Пожалуйста, выберите профиль для просмотра расписания.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
          <ScheduleFilter currentFilter={filter} />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
          <ScheduleFilter currentFilter={filter} />
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Не удалось загрузить данные расписания: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!weeks || weeks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
          <ScheduleFilter currentFilter={filter} />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Нет данных</AlertTitle>
          <AlertDescription>Расписание для выбранного профиля не найдено.</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={handleCreateSchedule} disabled={isCreatingSchedule} size="lg">
            {isCreatingSchedule ? "Создание расписания..." : "Создать расписание"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
        <div className="flex gap-2">
          <ScheduleFilter currentFilter={filter} />
          {isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Завершить редактирование
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Редактировать расписание
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {weeks.map((week) => (
          <ScheduleWeek key={week.id} week={week} filter={filter} isEditing={isEditing} />
        ))}
      </div>
    </div>
  )
}
