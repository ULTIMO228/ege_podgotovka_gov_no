import { getBrowserClient } from "./supabase"
import type { Week, Day, Task, TodoItem, UserStats, Achievement } from "../types/database"

// Weeks
export async function getWeeks() {
  const { data, error } = await getBrowserClient().from("weeks").select("*").order("start_date", { ascending: true })

  if (error) throw error
  return data as Week[]
}

// Days
export async function getDays(weekId?: number) {
  let query = getBrowserClient().from("days").select("*").order("date", { ascending: true })

  if (weekId) {
    query = query.eq("week_id", weekId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Day[]
}

export async function getDaysByDateRange(startDate: string, endDate: string) {
  const { data, error } = await getBrowserClient()
    .from("days")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) throw error
  return data as Day[]
}

export async function updateDayInfo(
  dayId: number,
  updates: {
    comment?: string
    efficiency?: number
    usefulness?: number
    study_hours?: number
  },
) {
  const { data, error } = await getBrowserClient().from("days").update(updates).eq("id", dayId).select()

  if (error) throw error
  return data[0] as Day
}

// Tasks
export async function getTasks(dayId?: number) {
  let query = getBrowserClient().from("tasks").select("*")

  if (dayId) {
    query = query.eq("day_id", dayId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Task[]
}

export async function getExamTasks() {
  const { data, error } = await getBrowserClient()
    .from("tasks")
    .select("*, day:day_id(*)")
    .eq("is_exam", true)
    .order("day_id", { ascending: true })

  if (error) throw error
  return data
}

export async function updateTaskCompletion(taskId: number, isCompleted: boolean) {
  const { data, error } = await getBrowserClient()
    .from("tasks")
    .update({ is_completed: isCompleted })
    .eq("id", taskId)
    .select()

  if (error) throw error

  // Update user stats
  await updateUserStats(isCompleted)

  return data[0] as Task
}

export async function updateTaskScore(taskId: number, score: number) {
  const { data, error } = await getBrowserClient().from("tasks").update({ score }).eq("id", taskId).select()

  if (error) throw error
  return data[0] as Task
}

// Todo Items
export async function getTodoItems() {
  const { data, error } = await getBrowserClient()
    .from("todo_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as TodoItem[]
}

export async function addTodoItem(text: string) {
  const { data, error } = await getBrowserClient().from("todo_items").insert({ text, is_completed: false }).select()

  if (error) throw error
  return data[0] as TodoItem
}

export async function updateTodoCompletion(todoId: number, isCompleted: boolean) {
  const { data, error } = await getBrowserClient()
    .from("todo_items")
    .update({ is_completed: isCompleted })
    .eq("id", todoId)
    .select()

  if (error) throw error

  // Update user stats
  await updateUserStats(isCompleted)

  return data[0] as TodoItem
}

export async function deleteTodoItem(todoId: number) {
  const { error } = await getBrowserClient().from("todo_items").delete().eq("id", todoId)

  if (error) throw error
  return true
}

// User Stats
export async function getUserStats() {
  // For now, we'll just get the first stats record
  // In a real app with authentication, you'd filter by user_id
  const { data, error } = await getBrowserClient().from("user_stats").select("*").limit(1)

  if (error) throw error

  if (data.length === 0) {
    // Create initial stats if none exist
    return createInitialUserStats()
  }

  return data[0] as UserStats
}

async function createInitialUserStats() {
  const { data, error } = await getBrowserClient()
    .from("user_stats")
    .insert({
      total_tasks: 0,
      completed_tasks: 0,
      streak_days: 0,
      points: 0,
      level: 1,
      last_activity_date: new Date().toISOString().split("T")[0],
    })
    .select()

  if (error) throw error
  return data[0] as UserStats
}

async function updateUserStats(taskCompleted: boolean) {
  const stats = await getUserStats()
  const today = new Date().toISOString().split("T")[0]

  let streakDays = stats.streak_days
  let points = stats.points
  let completedTasks = stats.completed_tasks

  if (taskCompleted) {
    // Increment completed tasks and points
    completedTasks += 1
    points += 5

    // Update streak if it's a new day
    if (stats.last_activity_date !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (stats.last_activity_date === yesterdayStr) {
        // Consecutive day
        streakDays += 1

        // Bonus points for streak
        if (streakDays % 3 === 0) {
          points += 15 // Bonus every 3 days
        }
      } else {
        // Streak broken
        streakDays = 1
      }
    }
  } else {
    // Task unchecked
    completedTasks = Math.max(0, completedTasks - 1)
    points = Math.max(0, points - 5)
  }

  // Calculate level (1 level per 100 points)
  const level = Math.max(1, Math.floor(points / 100) + 1)

  const { data, error } = await getBrowserClient()
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
    .select()

  if (error) throw error
  return data[0] as UserStats
}

// Achievements
export async function getAchievements() {
  const { data, error } = await getBrowserClient().from("achievements").select("*")

  if (error) throw error
  return data as Achievement[]
}

export async function getUserAchievements() {
  const { data, error } = await getBrowserClient()
    .from("user_achievements")
    .select(`
      *,
      achievement:achievement_id(*)
    `)

  if (error) throw error
  return data
}

export async function checkAndUnlockAchievements() {
  const stats = await getUserStats()
  const achievements = await getAchievements()
  const userAchievements = await getUserAchievements()

  const unlockedIds = userAchievements.map((ua) => ua.achievement_id)
  const newAchievements = []

  // Check for achievements based on stats
  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement.id)) continue

    let shouldUnlock = false

    // Logic for different achievement types
    switch (achievement.name) {
      case "First Task":
        shouldUnlock = stats.completed_tasks >= 1
        break
      case "Task Master":
        shouldUnlock = stats.completed_tasks >= 10
        break
      case "3-Day Streak":
        shouldUnlock = stats.streak_days >= 3
        break
      case "Week Warrior":
        shouldUnlock = stats.streak_days >= 7
        break
      // Add more achievement checks as needed
    }

    if (shouldUnlock) {
      // Unlock the achievement
      const { data, error } = await getBrowserClient()
        .from("user_achievements")
        .insert({
          achievement_id: achievement.id,
        })
        .select()

      if (!error && data) {
        newAchievements.push({
          ...achievement,
          unlocked_at: new Date().toISOString(),
        })

        // Add achievement points to user
        await getBrowserClient()
          .from("user_stats")
          .update({
            points: stats.points + achievement.points,
          })
          .eq("id", stats.id)
      }
    }
  }

  return newAchievements
}
