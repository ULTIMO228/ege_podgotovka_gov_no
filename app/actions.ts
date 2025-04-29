"use server"

import { revalidatePath } from "next/cache"
import { getServerClient } from "@/lib/supabase"
import { getProfileName } from "@/lib/profile"
import { format, startOfWeek, endOfWeek } from "date-fns"
import type { Task } from "@/types/database"

export async function updateDayInfo(
  dayId: number,
  updates: {
    comment?: string
    efficiency?: number
    usefulness?: number
    study_hours?: number
    day_type?: string
  },
) {
  const supabase = getServerClient()
  const { error } = await supabase.from("days").update(updates).eq("id", dayId)

  if (error) {
    throw new Error(`Failed to update day: ${error.message}`)
  }

  revalidatePath("/schedule")
}

export async function addTask(
  profileName: string,
  dayId: number,
  task: Omit<Task, "id" | "created_at" | "user_profile_name">,
) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").insert({
    ...task,
    day_id: dayId,
    user_profile_name: profileName,
  })

  if (error) {
    throw new Error(`Failed to add task: ${error.message}`)
  }

  revalidatePath("/schedule")
}

export async function updateTask(taskId: number, updates: Partial<Task>) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").update(updates).eq("id", taskId)

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  revalidatePath("/schedule")
}

export async function updateTotalTasks(profileName: string, increment: number) {
  const supabase = getServerClient()

  // Get current stats
  const { data: statsData, error: statsError } = await supabase
    .from("user_stats")
    .select("total_tasks")
    .eq("user_profile_name", profileName)
    .limit(1)

  if (statsError) {
    throw new Error(`Failed to get user stats: ${statsError.message}`)
  }

  const currentTotalTasks = statsData?.[0]?.total_tasks || 0

  // Update total_tasks
  const { error } = await supabase
    .from("user_stats")
    .update({ total_tasks: currentTotalTasks + increment })
    .eq("user_profile_name", profileName)

  if (error) {
    throw new Error(`Failed to update total tasks: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/schedule")
}

export async function updateTaskScore(taskId: number, score: number) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").update({ score }).eq("id", taskId)

  if (error) {
    throw new Error(`Failed to update task score: ${error.message}`)
  }

  revalidatePath("/exams")
}

export async function toggleTaskCompletion(taskId: number, isCompleted: boolean) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").update({ is_completed: isCompleted }).eq("id", taskId)

  if (error) {
    throw new Error(`Failed to toggle task completion: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/todos")
  revalidatePath("/exams")
}

export async function deleteTask(taskId: number) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  revalidatePath("/schedule")
}

export async function addTodoItem(formData: FormData) {
  "use server"

  const text = formData.get("text") as string
  const supabase = getServerClient()

  // Get profile from cookies
  const profileName = getProfileName()

  if (!profileName) {
    throw new Error("Profile not found")
  }

  const { error } = await supabase.from("todo_items").insert({
    text: text,
    is_completed: false,
    user_profile_name: profileName,
  })

  if (error) {
    throw new Error(`Failed to add todo item: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/todos")
}

export async function toggleTodoCompletion(todoId: number, isCompleted: boolean) {
  const supabase = getServerClient()

  const { error } = await supabase.from("todo_items").update({ is_completed: isCompleted }).eq("id", todoId)

  if (error) {
    throw new Error(`Failed to toggle todo completion: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/todos")
}

export async function deleteTodoItem(todoId: number) {
  const supabase = getServerClient()

  const { error } = await supabase.from("todo_items").delete().eq("id", todoId)

  if (error) {
    throw new Error(`Failed to delete todo item: ${error.message}`)
  }

  revalidatePath("/todos")
}

export async function createScheduleForProfile(profileName: string) {
  const supabase = getServerClient()

  // Create weeks
  const { data: weeks } = await supabase
    .from("weeks")
    .insert([
      {
        title: "Неделя 1",
        start_date: "2024-10-28",
        end_date: "2024-11-03",
        user_profile_name: profileName,
      },
      {
        title: "Неделя 2",
        start_date: "2024-11-04",
        end_date: "2024-11-10",
        user_profile_name: profileName,
      },
      {
        title: "Неделя 3",
        start_date: "2024-11-11",
        end_date: "2024-11-17",
        user_profile_name: profileName,
      },
    ])
    .select()

  if (!weeks) throw new Error("Failed to create weeks")

  // Create days for each week
  for (const week of weeks) {
    const days = [
      {
        date: "2024-10-28",
        day_name: "Пн",
        day_type: "weekday",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-10-29",
        day_name: "Вт",
        day_type: "weekday",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-10-30",
        day_name: "Ср",
        day_type: "training",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-10-31",
        day_name: "Чт",
        day_type: "weekday",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-11-01",
        day_name: "Пт",
        day_type: "training",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-11-02",
        day_name: "Сб",
        day_type: "weekend",
        week_id: week.id,
        user_profile_name: profileName,
      },
      {
        date: "2024-11-03",
        day_name: "Вс",
        day_type: "weekend",
        week_id: week.id,
        user_profile_name: profileName,
      },
    ]

    await supabase.from("days").insert(days)
  }

  revalidatePath("/schedule")
}

// Добавляем недостающие функции

export async function updateProfileSettings(
  profileName: string,
  settings: {
    training_days: number[]
    study_goal_weekday?: number | null
    study_goal_training?: number | null
    study_goal_weekend?: number | null
  },
) {
  const supabase = getServerClient()

  // Обновляем настройки профиля
  const { error } = await supabase
    .from("user_profiles")
    .update({
      training_days: settings.training_days,
      study_goal_weekday: settings.study_goal_weekday,
      study_goal_training: settings.study_goal_training,
      study_goal_weekend: settings.study_goal_weekend,
    })
    .eq("name", profileName)

  if (error) {
    throw new Error(`Failed to update profile settings: ${error.message}`)
  }

  // Обновляем типы дней на основе дней тренировок
  await updateDayTypesForProfile(profileName, settings.training_days)

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/report")
}

async function updateDayTypesForProfile(profileName: string, trainingDays: number[]) {
  const supabase = getServerClient()

  // Получаем все дни профиля
  const { data: days, error: daysError } = await supabase
    .from("days")
    .select("id, date, day_type")
    .eq("user_profile_name", profileName)

  if (daysError) {
    throw new Error(`Failed to get days: ${daysError.message}`)
  }

  if (!days || days.length === 0) return

  // Обновляем типы дней
  for (const day of days) {
    // Пропускаем выходные и экзамены
    if (day.day_type === "weekend" || day.day_type === "exam") continue

    const dayDate = new Date(day.date)
    const dayOfWeek = dayDate.getDay() // 0 = воскресенье, 1 = понедельник, ...

    // Определяем, является ли день тренировочным
    const isTrainingDay = trainingDays.includes(dayOfWeek)
    const newDayType = isTrainingDay ? "training" : "weekday"

    // Обновляем тип дня, если он изменился
    if (day.day_type !== newDayType) {
      await supabase.from("days").update({ day_type: newDayType }).eq("id", day.id)
    }
  }
}

export async function getWeeklyHoursReport(profileName: string, startDateStr: string, endDateStr: string) {
  const supabase = getServerClient()

  // Получаем все дни в указанном диапазоне
  const { data: days, error: daysError } = await supabase
    .from("days")
    .select("*")
    .eq("user_profile_name", profileName)
    .gte("date", startDateStr)
    .lte("date", endDateStr)
    .order("date", { ascending: true })

  if (daysError) {
    throw new Error(`Failed to get days: ${daysError.message}`)
  }

  if (!days || days.length === 0) return []

  // Получаем настройки профиля для целей
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("study_goal_weekday, study_goal_training, study_goal_weekend")
    .eq("name", profileName)
    .single()

  if (profileError) {
    throw new Error(`Failed to get profile settings: ${profileError.message}`)
  }

  // Получаем задачи для этих дней
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_profile_name", profileName)
    .in(
      "day_id",
      days.map((day) => day.id),
    )

  if (tasksError) {
    throw new Error(`Failed to get tasks: ${tasksError.message}`)
  }

  // Группируем дни по неделям
  const weeklyData: Record<string, any> = {}

  for (const day of days) {
    const date = new Date(day.date)
    const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const weekKey = `${weekStart}_${weekEnd}`

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        weekStart,
        weekEnd,
        totalDays: 0,
        totalHours: 0,
        weekdayHours: 0,
        trainingHours: 0,
        weekendHours: 0,
        examHours: 0,
        completedTasks: 0,
        weeklyGoal: 0,
        days: [],
      }
    }

    weeklyData[weekKey].totalDays++
    weeklyData[weekKey].days.push(day)

    // Суммируем часы по типам дней
    if (day.study_hours) {
      weeklyData[weekKey].totalHours += day.study_hours

      switch (day.day_type) {
        case "weekday":
          weeklyData[weekKey].weekdayHours += day.study_hours
          break
        case "training":
          weeklyData[weekKey].trainingHours += day.study_hours
          break
        case "weekend":
          weeklyData[weekKey].weekendHours += day.study_hours
          break
        case "exam":
          weeklyData[weekKey].examHours += day.study_hours
          break
      }
    }
  }

  // Подсчитываем выполненные задачи
  if (tasks) {
    for (const task of tasks) {
      if (task.is_completed) {
        const day = days.find((d) => d.id === task.day_id)
        if (day) {
          const date = new Date(day.date)
          const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
          const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
          const weekKey = `${weekStart}_${weekEnd}`

          if (weeklyData[weekKey]) {
            weeklyData[weekKey].completedTasks++
          }
        }
      }
    }
  }

  // Рассчитываем цели для каждой недели
  for (const weekKey in weeklyData) {
    const week = weeklyData[weekKey]
    let weeklyGoal = 0

    // Подсчитываем цель на неделю на основе типов дней
    for (const day of week.days) {
      switch (day.day_type) {
        case "weekday":
          weeklyGoal += profileData.study_goal_weekday || 0
          break
        case "training":
          weeklyGoal += profileData.study_goal_training || 0
          break
        case "weekend":
          weeklyGoal += profileData.study_goal_weekend || 0
          break
      }
    }

    week.weeklyGoal = weeklyGoal
  }

  // Преобразуем объект в массив и сортируем по дате начала недели
  return Object.values(weeklyData).sort((a: any, b: any) => {
    return new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  })
}
