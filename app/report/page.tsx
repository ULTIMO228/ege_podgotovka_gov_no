"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { ru } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Calendar, Clock, Target, CheckCircle } from "lucide-react"
import { useProfile } from "@/context/ProfileContext"
import { getWeeklyHoursReport } from "@/app/actions"
import { Badge } from "@/components/ui/badge"

export default function ReportPage() {
  const { selectedProfile } = useProfile()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(() => {
    const today = new Date()
    const startDate = startOfWeek(today, { weekStartsOn: 1 }) // Начало текущей недели (понедельник)
    const endDate = endOfWeek(today, { weekStartsOn: 1 }) // Конец текущей недели (воскресенье)
    return { from: startDate, to: endDate }
  })
  const [report, setReport] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      if (!selectedProfile || !dateRange) return

      try {
        setLoading(true)
        const reportData = await getWeeklyHoursReport(
          selectedProfile,
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
        )
        setReport(reportData)
      } catch (err: any) {
        console.error("Error fetching report:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [selectedProfile, dateRange])

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range)
  }

  // Функция для форматирования диапазона дат недели
  const formatWeekRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${format(start, "d MMM", { locale: ru })} - ${format(end, "d MMM yyyy", { locale: ru })}`
  }

  // Функция для определения статуса выполнения цели
  const getGoalStatus = (actual: number, goal: number) => {
    if (!goal) return null
    const percentage = (actual / goal) * 100
    if (percentage >= 100) return "success"
    if (percentage >= 75) return "warning"
    return "danger"
  }

  if (!selectedProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Отчеты</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не выбран</AlertTitle>
          <AlertDescription>Пожалуйста, выберите профиль для просмотра отчетов.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Отчеты</h1>
        <div className="w-full sm:w-auto">
          <DateRangePicker
            appliedRange={dateRange}
            onRangeChange={handleDateRangeChange}
            placeholder="Выберите период"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>Не удалось загрузить отчет: {error}</AlertDescription>
        </Alert>
      ) : report.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Нет данных</AlertTitle>
          <AlertDescription>Нет данных для выбранного периода или не заполнены часы занятий.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.map((week) => (
            <Card key={week.weekStart}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Неделя {formatWeekRange(week.weekStart, week.weekEnd)}
                </CardTitle>
                <CardDescription>
                  {week.totalDays} дней, {week.completedTasks} задач выполнено
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Всего часов:</span>
                    </div>
                    <span className="font-medium">{week.totalHours} ч</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-green-500" />
                        <span>Цель на неделю:</span>
                      </div>
                      <span className="font-medium">{week.weeklyGoal} ч</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Выполнение:</span>
                      </div>
                      <Badge
                        variant={
                          getGoalStatus(week.totalHours, week.weeklyGoal) === "success"
                            ? "success"
                            : getGoalStatus(week.totalHours, week.weeklyGoal) === "warning"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {week.weeklyGoal ? Math.round((week.totalHours / week.weeklyGoal) * 100) + "%" : "Нет цели"}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Будние дни</p>
                        <p className="font-medium">{week.weekdayHours} ч</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Тренировки</p>
                        <p className="font-medium">{week.trainingHours} ч</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Выходные</p>
                        <p className="font-medium">{week.weekendHours} ч</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Экзамены</p>
                        <p className="font-medium">{week.examHours} ч</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
