"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { useProfileContext } from "@/components/auth-provider"
import { getBrowserClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Calendar, Clock } from "lucide-react"
import { format, parseISO, startOfWeek, endOfWeek, getISOWeek, getYear } from "date-fns"
import { ru } from "date-fns/locale"

interface WeeklyReport {
  weekStart: Date
  weekEnd: Date
  weekNumber: number
  year: number
  totalHours: number
}

export default function ReportPage() {
  const { selectedProfile } = useProfileContext()
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [totalHours, setTotalHours] = useState(0)

  // Обработчик изменения диапазона дат
  const handleRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Загружаем отчет при изменении диапазона дат
  useEffect(() => {
    if (!selectedProfile || !startDate) return

    const fetchReport = async () => {
      setIsLoading(true)
      try {
        // Формируем запрос к базе данных
        const query = getBrowserClient()
          .from("days")
          .select("date, study_hours")
          .eq("user_profile_name", selectedProfile)
          .gte("date", startDate.toISOString().split("T")[0])

        // Если есть конечная дата, добавляем ее в запрос
        if (endDate) {
          query.lte("date", endDate.toISOString().split("T")[0])
        } else {
          // Если конечной даты нет, используем только начальную дату
          query.lte("date", startDate.toISOString().split("T")[0])
        }

        const { data, error } = await query

        if (error) throw error

        // Группируем данные по неделям
        const weeklyData: Record<string, { dates: Date[]; hours: number[] }> = {}

        data?.forEach((day) => {
          if (day.date && day.study_hours !== null) {
            const date = parseISO(day.date)
            const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Неделя начинается с понедельника
            const weekKey = format(weekStart, "yyyy-MM-dd")

            if (!weeklyData[weekKey]) {
              weeklyData[weekKey] = { dates: [], hours: [] }
            }

            weeklyData[weekKey].dates.push(date)
            weeklyData[weekKey].hours.push(day.study_hours)
          }
        })

        // Преобразуем данные в формат для отображения
        const reports: WeeklyReport[] = Object.entries(weeklyData)
          .map(([weekKey, data]) => {
            const weekStart = parseISO(weekKey)
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
            const totalHours = data.hours.reduce((sum, hours) => sum + hours, 0)

            return {
              weekStart,
              weekEnd,
              weekNumber: getISOWeek(weekStart),
              year: getYear(weekStart),
              totalHours,
            }
          })
          .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime()) // Сортируем по убыванию даты

        setWeeklyReports(reports)

        // Считаем общую сумму часов
        const total = reports.reduce((sum, report) => sum + report.totalHours, 0)
        setTotalHours(total)
      } catch (error) {
        console.error("Error fetching report:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить отчет",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [selectedProfile, startDate, endDate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Отчет по времени обучения</h1>
        <p className="text-muted-foreground">Просмотр статистики по затраченным часам</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Выберите период</CardTitle>
          <CardDescription>Укажите диапазон дат для формирования отчета</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
              placeholder="Выберите период для отчета"
            />
          </div>
        </CardContent>
      </Card>

      {startDate && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты</CardTitle>
            <CardDescription>
              {endDate
                ? `Отчет за период с ${format(startDate, "d MMMM yyyy", { locale: ru })} по ${format(endDate, "d MMMM yyyy", { locale: ru })}`
                : `Отчет за ${format(startDate, "d MMMM yyyy", { locale: ru })}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : weeklyReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет данных для выбранного периода</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">Всего часов за период:</span>
                  </div>
                  <span className="text-xl font-bold">{totalHours.toFixed(1)}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Распределение по неделям</h3>
                  <div className="grid gap-4">
                    {weeklyReports.map((report) => (
                      <div
                        key={`${report.year}-${report.weekNumber}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              Неделя {report.weekNumber}, {report.year}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(report.weekStart, "d MMM", { locale: ru })} -{" "}
                              {format(report.weekEnd, "d MMM", { locale: ru })}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold">{report.totalHours.toFixed(1)} ч</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
