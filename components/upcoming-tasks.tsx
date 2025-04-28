import { getServerClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskList } from "@/components/task-list"

export async function UpcomingTasks() {
  const supabase = getServerClient()

  // Get today's date
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  // Get date 7 days from now
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split("T")[0]

  // Get days in the next 7 days
  const { data: days } = await supabase
    .from("days")
    .select("*")
    .gte("date", todayStr)
    .lte("date", nextWeekStr)
    .order("date", { ascending: true })

  if (!days || days.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Нет предстоящих задач на ближайшую неделю</div>
  }

  // Get tasks for these days
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, day:day_id(*)")
    .in(
      "day_id",
      days.map((day) => day.id),
    )
    .eq("is_completed", false)
    .order("day_id", { ascending: true })

  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Нет невыполненных задач на ближайшую неделю</div>
  }

  // Group tasks by day
  const tasksByDay = tasks.reduce(
    (acc, task) => {
      const dayId = task.day_id
      if (!acc[dayId]) {
        acc[dayId] = []
      }
      acc[dayId].push(task)
      return acc
    },
    {} as Record<number, typeof tasks>,
  )

  // Get day type text
  const getDayTypeText = (type: string) => {
    switch (type) {
      case "weekend":
        return "Выходной"
      case "weekday":
        return "Будний"
      case "training":
        return "Тренировка"
      case "exam":
        return "Экзамен"
      default:
        return type
    }
  }

  // Get badge variant based on day type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "weekend":
        return "secondary"
      case "weekday":
        return "default"
      case "training":
        return "warning"
      case "exam":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(tasksByDay).map(([dayId, dayTasks]) => {
        const day = dayTasks[0].day

        // Format date
        const date = new Date(day.date)
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")} ${day.day_name}`

        // Check if this is today
        const isToday = day.date === todayStr

        return (
          <Card key={dayId} className={isToday ? "border-primary" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{formattedDate}</span>
                  {isToday && <Badge variant="outline">Сегодня</Badge>}
                </div>
                <Badge variant={getBadgeVariant(day.day_type)}>{getDayTypeText(day.day_type)}</Badge>
              </div>

              <TaskList tasks={dayTasks} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
