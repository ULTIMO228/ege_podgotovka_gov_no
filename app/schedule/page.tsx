"use client"

import { useState, useEffect, Suspense } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ScheduleFilter } from "@/components/schedule-filter"
import { ScheduleWeek } from "@/components/schedule-week"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useProfileContext } from "@/components/auth-provider"
import { ScheduleEditor } from "@/components/schedule-editor"

export default function SchedulePage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = searchParams.filter || "all"
  const { selectedProfile } = useProfileContext()
  const [weeks, setWeeks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSchedule, setHasSchedule] = useState(false)

  // Загружаем недели для выбранного профиля
  useEffect(() => {
    const fetchWeeks = async () => {
      if (!selectedProfile) return

      setIsLoading(true)
      try {
        const supabase = createClientComponentClient()
        const { data, error, count } = await supabase
          .from("weeks")
          .select("*", { count: "exact" })
          .eq("user_profile_name", selectedProfile)
          .order("start_date", { ascending: true })

        if (error) throw error

        setWeeks(data || [])
        setHasSchedule(count !== null && count > 0)
      } catch (err) {
        console.error("Error fetching weeks:", err)
        setError("Не удалось загрузить данные расписания. Пожалуйста, попробуйте позже.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeeks()
  }, [selectedProfile])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Расписание подготовки к ЕГЭ</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          {hasSchedule && <ScheduleFilter currentFilter={filter} />}
          <ScheduleEditor hasSchedule={hasSchedule} />
        </div>
      </div>

      {!hasSchedule ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Нет данных</AlertTitle>
          <AlertDescription>
            Расписание для профиля {selectedProfile} пока не создано. Нажмите кнопку "Создать расписание" для начала
            работы.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8">
          {weeks.map((week) => (
            <Suspense key={week.id} fallback={<Skeleton className="h-[400px] w-full" />}>
              <ScheduleWeek week={week} filter={filter} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  )
}
