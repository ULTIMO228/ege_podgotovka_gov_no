"use server"

import { getServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Обновление статуса задачи
export async function toggleTaskCompletion(profileName: string, taskId: number, isCompleted: boolean) {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({ is_completed: isCompleted })
    .eq("id", taskId)
    .eq("user_profile_name", profileName) // Фильтр по профилю
    .select()

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  // Обновляем статистику пользователя
  await updateUserStats(profileName, isCompleted)

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/exams")

  return data[0]
}

// Обновление баллов задачи
export async function updateTaskScore(profileName: string, taskId: number, score: number) {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({ score })
    .eq("id", taskId)
    .eq("user_profile_name", profileName) // Фильтр по профилю
    .select()

  if (error) {
    throw new Error(`Failed to update task score: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/exams")

  return data[0]
}

// Обновление информации о дне
export async function updateDayInfo(
  profileName: string,
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

  const { data, error } = await supabase
    .from("days")
    .update(updates)
    .eq("id", dayId)
    .eq("user_profile_name", profileName) // Фильтр по профилю
    .select()

  if (error) {
    throw new Error(`Failed to update day info: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/schedule")

  return data[0]
}

// Добавление задачи
export async function addTask(
  profileName: string,
  taskData: {
    day_id: number
    description: string
    duration: string
    time_of_day: string
    is_exam: boolean
    activity_template_id?: number | null
  },
) {
  const supabase = getServerClient()

  // Добавляем профиль к данным задачи
  const taskWithProfile = {
    ...taskData,
    user_profile_name: profileName,
  }

  const { data, error } = await supabase.from("tasks").insert(taskWithProfile).select()

  if (error) {
    throw new Error(`Failed to add task: ${error.message}`)
  }

  // Обновляем общее количество задач в статистике
  await updateTotalTasks(profileName, 1)

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/exams")

  return data[0]
}

// Обновление задачи
export async function updateTask(
  profileName: string,
  taskId: number,
  taskData: {
    description: string
    duration: string
    time_of_day: string
    is_exam: boolean
    activity_template_id?: number | null
  },
) {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("tasks")
    .update(taskData)
    .eq("id", taskId)
    .eq("user_profile_name", profileName) // Фильтр по профилю
    .select()

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/exams")

  return data[0]
}

// Удаление задачи
export async function deleteTask(profileName: string, taskId: number) {
  const supabase = getServerClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_profile_name", profileName) // Фильтр по профилю

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  // Обновляем общее количество задач в статистике
  await updateTotalTasks(profileName, -1)

  revalidatePath("/")
  revalidatePath("/schedule")
  revalidatePath("/exams")

  return { success: true }
}

// Обновление общего количества задач
export async function updateTotalTasks(profileName: string, change: number) {
  const supabase = getServerClient()

  // Получаем текущую статистику
  const { data: statsData, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_profile_name", profileName)
    .limit(1)

  if (statsError) {
    throw new Error(`Failed to get user stats: ${statsError.message}`)
  }

  let stats
  if (statsData.length === 0) {
    // Создаем начальную статистику, если ее нет
    const { data: newStats, error: createError } = await supabase
      .from("user_stats")
      .insert({
        total_tasks: Math.max(0, change),
        completed_tasks: 0,
        streak_days: 0,
        points: 0,
        level: 1,
        last_activity_date: new Date().toISOString().split("T")[0],
        user_profile_name: profileName,
      })
      .select()

    if (createError) {
      throw new Error(`Failed to create user stats: ${createError.message}`)
    }

    stats = newStats[0]
  } else {
    stats = statsData[0]

    // Обновляем total_tasks
    const { error: updateError } = await supabase
      .from("user_stats")
      .update({
        total_tasks: Math.max(0, stats.total_tasks + change),
      })
      .eq("id", stats.id)
      .eq("user_profile_name", profileName)

    if (updateError) {
      throw new Error(`Failed to update total tasks: ${updateError.message}`)
    }
  }

  return { success: true }
}

// Добавление задачи в список дел
export async function addTodoItem(profileName: string, formData: FormData) {
  const text = formData.get("text") as string

  if (!text || text.trim() === "") {
    throw new Error("Todo text cannot be empty")
  }

  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("todo_items")
    .insert({ text: text.trim(), is_completed: false, user_profile_name: profileName })
    .select()

  if (error) {
    throw new Error(`Failed to add todo item: ${error.message}`)
  }

  revalidatePath("/")

  return data[0]
}

// Переключение статуса задачи в списке дел
export async function toggleTodoCompletion(profileName: string, todoId: number, isCompleted: boolean) {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from("todo_items")
    .update({ is_completed: isCompleted })
    .eq("id", todoId)
    .eq("user_profile_name", profileName) // Фильтр по профилю
    .select()

  if (error) {
    throw new Error(`Failed to update todo item: ${error.message}`)
  }

  // Обновляем статистику пользователя
  await updateUserStats(profileName, isCompleted)

  revalidatePath("/")

  return data[0]
}

// Удаление задачи из списка дел
export async function deleteTodoItem(profileName: string, todoId: number) {
  const supabase = getServerClient()

  const { error } = await supabase.from("todo_items").delete().eq("id", todoId).eq("user_profile_name", profileName) // Фильтр по профилю

  if (error) {
    throw new Error(`Failed to delete todo item: ${error.message}`)
  }

  revalidatePath("/")

  return { success: true }
}

// Обновление статистики пользователя
async function updateUserStats(profileName: string, taskCompleted: boolean) {
  const supabase = getServerClient()

  // Получаем текущую статистику
  const { data: statsData, error: statsError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_profile_name", profileName)
    .limit(1)

  if (statsError) {
    throw new Error(`Failed to get user stats: ${statsError.message}`)
  }

  let stats
  if (statsData.length === 0) {
    // Создаем начальную статистику, если ее нет
    const { data: newStats, error: createError } = await supabase
      .from("user_stats")
      .insert({
        total_tasks: 0,
        completed_tasks: 0,
        streak_days: 0,
        points: 0,
        level: 1,
        last_activity_date: new Date().toISOString().split("T")[0],
        user_profile_name: profileName,
      })
      .select()

    if (createError) {
      throw new Error(`Failed to create user stats: ${createError.message}`)
    }

    stats = newStats[0]
  } else {
    stats = statsData[0]
  }

  const today = new Date().toISOString().split("T")[0]

  let streakDays = stats.streak_days
  let points = stats.points
  let completedTasks = stats.completed_tasks

  if (taskCompleted) {
    // Увеличиваем количество выполненных задач и очки
    completedTasks += 1
    points += 5

    // Обновляем серию дней, если это новый день
    if (stats.last_activity_date !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (stats.last_activity_date === yesterdayStr) {
        // Последовательный день
        streakDays += 1

        // Бонусные очки за серию
        if (streakDays % 3 === 0) {
          points += 15 // Бонус каждые 3 дня
        }
      } else {
        // Серия прервана
        streakDays = 1
      }
    }
  } else {
    // Задача снята с выполнения
    completedTasks = Math.max(0, completedTasks - 1)
    points = Math.max(0, points - 5)
  }

  // Рассчитываем уровень (1 уровень на каждые 100 очков)
  const level = Math.max(1, Math.floor(points / 100) + 1)

  // Обновляем статистику
  const { error: updateError } = await supabase
    .from("user_stats")
    .update({
      completed_tasks: completedTasks,
      streak_days: streakDays,
      points: points,
      level: level,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stats.id)
    .eq("user_profile_name", profileName)

  if (updateError) {
    throw new Error(`Failed to update user stats: ${updateError.message}`)
  }

  // Проверяем достижения
  await checkAndUnlockAchievements(profileName, stats, completedTasks, streakDays)

  return { success: true }
}

// Проверка и разблокировка достижений
async function checkAndUnlockAchievements(profileName: string, stats: any, completedTasks: number, streakDays: number) {
  const supabase = getServerClient()

  // Получаем все достижения
  const { data: achievements, error: achievementsError } = await supabase.from("achievements").select("*")

  if (achievementsError) {
    throw new Error(`Failed to get achievements: ${achievementsError.message}`)
  }

  // Получаем разблокированные достижения пользователя
  const { data: userAchievements, error: userAchievementsError } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_profile_name", profileName)

  if (userAchievementsError) {
    throw new Error(`Failed to get user achievements: ${userAchievementsError.message}`)
  }

  const unlockedIds = userAchievements.map((ua) => ua.achievement_id)

  // Проверяем новые достижения
  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement.id)) continue

    let shouldUnlock = false

    // Логика для разных типов достижений
    switch (achievement.name) {
      case "First Task":
        shouldUnlock = completedTasks >= 1
        break
      case "Task Master":
        shouldUnlock = completedTasks >= 10
        break
      case "3-Day Streak":
        shouldUnlock = streakDays >= 3
        break
      case "Week Warrior":
        shouldUnlock = streakDays >= 7
        break
      // Добавьте другие проверки достижений по мере необходимости
    }

    if (shouldUnlock) {
      // Разблокируем достижение
      await supabase.from("user_achievements").insert({
        achievement_id: achievement.id,
        user_profile_name: profileName,
      })

      // Добавляем очки достижения пользователю
      await supabase
        .from("user_stats")
        .update({
          points: stats.points + achievement.points,
        })
        .eq("id", stats.id)
        .eq("user_profile_name", profileName)
    }
  }
}

// Создание расписания для профиля
export async function createScheduleForProfile(profileName: string) {
  const supabase = getServerClient()

  // Получаем структуру недель и дней из профиля "Сева"
  const { data: sevaWeeks } = await supabase
    .from("weeks")
    .select("*")
    .eq("user_profile_name", "Сева")
    .order("start_date")

  if (!sevaWeeks || sevaWeeks.length === 0) {
    throw new Error("No template schedule found for profile 'Сева'")
  }

  // Получаем дни тренировок для профиля
  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("training_days")
    .eq("name", profileName)
    .single()

  const trainingDays = profileData?.training_days || []

  // Создаем недели для нового профиля
  for (const week of sevaWeeks) {
    // Создаем новую неделю
    const { data: newWeek } = await supabase
      .from("weeks")
      .insert({
        title: week.title,
        start_date: week.start_date,
        end_date: week.end_date,
        user_profile_name: profileName,
      })
      .select()

    if (!newWeek || newWeek.length === 0) continue

    // Получаем дни для этой недели из профиля "Сева"
    const { data: sevaDays } = await supabase
      .from("days")
      .select("*")
      .eq("week_id", week.id)
      .eq("user_profile_name", "Сева")
      .order("date")

    if (!sevaDays || sevaDays.length === 0) continue

    // Создаем дни для нового профиля
    for (const day of sevaDays) {
      // Определяем тип дня
      let dayType = day.day_type

      // Проверяем, является ли день экзаменом
      const isExamDay = ["2025-05-27", "2025-05-30", "2025-06-11"].includes(day.date)
      if (isExamDay) {
        dayType = "exam"
      } else {
        // Проверяем, является ли день тренировкой
        const dayDate = new Date(day.date)
        const dayOfWeek = dayDate.getDay() // 0 = Вс, 1 = Пн, ..., 6 = Сб
        if (trainingDays.includes(dayOfWeek)) {
          dayType = "training"
        }
      }

      // Создаем новый день
      await supabase.from("days").insert({
        week_id: newWeek[0].id,
        date: day.date,
        day_name: day.day_name,
        day_type: dayType,
        user_profile_name: profileName,
      })
    }
  }

  // Создаем начальную статистику для профиля
  const { data: statsData } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_profile_name", profileName)
    .limit(1)

  if (!statsData || statsData.length === 0) {
    await supabase.from("user_stats").insert({
      total_tasks: 0,
      completed_tasks: 0,
      streak_days: 0,
      points: 0,
      level: 1,
      last_activity_date: new Date().toISOString().split("T")[0],
      user_profile_name: profileName,
    })
  }

  return { success: true }
}
