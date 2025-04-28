import { getServerClient } from "@/lib/supabase"
import { ScheduleDay } from "@/components/schedule-day"
import type { Week } from "@/types/database"

export async function ScheduleWeek({ week, filter }: { week: Week; filter: string }) {
  const supabase = getServerClient()

  // Get days for this week
  const { data: days } = await supabase
    .from("days")
    .select("*")
    .eq("week_id", week.id)
    .order("date", { ascending: true })

  if (!days || days.length === 0) {
    return null // Возвращаем null вместо пустого блока
  }

  // Get all tasks for this week's days
  const dayIds = days.map((day) => day.id)
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .in("day_id", dayIds)
    .order("time_of_day", { ascending: true })

  // Filter days based on the selected filter
  const today = new Date().toISOString().split("T")[0]

  const filteredDays = days.filter((day) => {
    switch (filter) {
      case "upcoming":
        return day.date >= today
      case "past":
        return day.date < today
      case "today":
        return day.date === today
      case "weekend":
        return day.day_type === "weekend"
      case "weekday":
        return day.day_type === "weekday"
      case "exam":
        return day.day_type === "exam"
      default:
        return true
    }
  })

  if (filteredDays.length === 0) {
    return null // Возвращаем null вместо пустого блока
  }

  // Group tasks by day_id
  const tasksByDay = tasks?.reduce(
    (acc, task) => {
      if (!acc[task.day_id]) {
        acc[task.day_id] = []
      }
      acc[task.day_id].push(task)
      return acc
    },
    {} as Record<number, typeof tasks>,
  )

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">{week.title}</h2>
      <div className="space-y-4">
        {filteredDays.map((day) => (
          <ScheduleDay key={day.id} day={day} tasks={tasksByDay?.[day.id] || []} />
        ))}
      </div>
    </div>
  )
}
