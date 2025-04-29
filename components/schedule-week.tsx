"use client"

import { useState, useEffect } from "react"
import { getBrowserClient } from "@/lib/supabase"
import { ScheduleDay } from "@/components/schedule-day"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useProfile } from "@/context/ProfileContext"

interface ScheduleWeekProps {
  week: {
    id: number
    title: string
    start_date: string
    end_date: string
  }
  filter: string
  isEditing?: boolean
}

export function ScheduleWeek({ week, filter, isEditing = false }: ScheduleWeekProps) {
  const { selectedProfile } = useProfile()
  const [days, setDays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDays() {
      if (!selectedProfile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const supabase = getBrowserClient()

        const { data, error } = await supabase
          .from("days")
          .select("*")
          .eq("week_id", week.id)
          .eq("user_profile_name", selectedProfile)
          .order("date", { ascending: true })

        if (error) {
          throw error
        }

        setDays(data || [])
      } catch (err: any) {
        console.error("Error fetching days:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDays()
  }, [week.id, selectedProfile])

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>Не удалось загрузить данные дней: {error}</AlertDescription>
      </Alert>
    )
  }

  if (!days || days.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Нет данных</AlertTitle>
        <AlertDescription>Дни для недели не найдены.</AlertDescription>
      </Alert>
    )
  }

  // Фильтрация дней по типу
  const filteredDays = days.filter((day) => {
    if (filter === "all") return true
    if (filter === "exams") return day.day_type === "exam"
    if (filter === "training") return day.day_type === "training"
    if (filter === "weekdays") return day.day_type === "weekday"
    if (filter === "weekends") return day.day_type === "weekend"
    return true
  })

  if (filteredDays.length === 0) {
    return null // Не показываем неделю, если нет дней, соответствующих фильтру
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{week.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDays.map((day) => (
          <ScheduleDay key={day.id} day={day} isEditing={isEditing} />
        ))}
      </div>
    </div>
  )
}
