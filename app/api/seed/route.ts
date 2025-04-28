import { getServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// Защита от случайного вызова в production
const isProtected = process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED

export async function GET() {
  if (isProtected) {
    return NextResponse.json({ error: "Seed operation is not allowed in production" }, { status: 403 })
  }

  try {
    const supabase = getServerClient()

    // Очистка существующих данных
    await supabase.from("user_achievements").delete().neq("id", 0)
    await supabase.from("user_stats").delete().neq("id", 0)
    await supabase.from("todo_items").delete().neq("id", 0)
    await supabase.from("tasks").delete().neq("id", 0)
    await supabase.from("days").delete().neq("id", 0)
    await supabase.from("weeks").delete().neq("id", 0)
    await supabase.from("activity_templates").delete().neq("id", 0)
    await supabase.from("achievements").delete().neq("id", 0)
    await supabase.from("user_profiles").delete().neq("id", 0)

    // Создание шаблонов активностей
    const activityTemplates = [
      // Русский язык
      { subject_key: "rus", activity_key: "nareshka", description: "Нарешка по русскому", default_duration: 2 },
      {
        subject_key: "rus",
        activity_key: "part1_probnik",
        description: "Пробник часть 1 (русский)",
        default_duration: 1.5,
      },
      { subject_key: "rus", activity_key: "sochinenie", description: "Сочинение", default_duration: 1.5 },
      {
        subject_key: "rus",
        activity_key: "full_probnik",
        description: "Полный пробник по русскому",
        default_duration: 3.5,
      },

      // Математика (профильная)
      { subject_key: "math_prof", activity_key: "nareshka", description: "Нарешка по математике", default_duration: 2 },
      {
        subject_key: "math_prof",
        activity_key: "part1_probnik",
        description: "Пробник часть 1 (математика)",
        default_duration: 1.5,
      },
      {
        subject_key: "math_prof",
        activity_key: "part2_probnik",
        description: "Пробник часть 2 (математика)",
        default_duration: 2,
      },
      {
        subject_key: "math_prof",
        activity_key: "full_probnik",
        description: "Полный пробник по математике",
        default_duration: 4,
      },

      // Информатика
      { subject_key: "inf", activity_key: "nareshka", description: "Нарешка по информатике", default_duration: 2 },
      { subject_key: "inf", activity_key: "hardprog", description: "Сложное программирование", default_duration: 2 },
      {
        subject_key: "inf",
        activity_key: "part1_probnik",
        description: "Пробник часть 1 (информатика)",
        default_duration: 1.5,
      },
      {
        subject_key: "inf",
        activity_key: "part2_probnik",
        description: "Пробник часть 2 (информатика)",
        default_duration: 2,
      },
      {
        subject_key: "inf",
        activity_key: "full_probnik",
        description: "Полный пробник по информатике",
        default_duration: 4,
      },

      // Физика
      { subject_key: "phys", activity_key: "nareshka", description: "Нарешка по физике", default_duration: 2 },
      {
        subject_key: "phys",
        activity_key: "part1_probnik",
        description: "Пробник часть 1 (физика)",
        default_duration: 2,
      },
      {
        subject_key: "phys",
        activity_key: "part2_probnik",
        description: "Пробник часть 2 (физика)",
        default_duration: 2,
      },
      {
        subject_key: "phys",
        activity_key: "full_probnik",
        description: "Полный пробник по физике",
        default_duration: 4,
      },
    ]

    await supabase.from("activity_templates").insert(activityTemplates)

    // Создание достижений
    const achievements = [
      {
        name: "First Task",
        description: "Выполните свою первую задачу",
        icon_name: "check",
        points: 10,
      },
      {
        name: "Task Master",
        description: "Выполните 10 задач",
        icon_name: "award",
        points: 20,
      },
      {
        name: "3-Day Streak",
        description: "Будьте активны 3 дня подряд",
        icon_name: "calendar",
        points: 15,
      },
      {
        name: "Week Warrior",
        description: "Будьте активны 7 дней подряд",
        icon_name: "trophy",
        points: 30,
      },
      {
        name: "Point Collector",
        description: "Наберите 100 очков",
        icon_name: "star",
        points: 25,
      },
      {
        name: "EGE Champion",
        description: "Достигните 5 уровня",
        icon_name: "zap",
        points: 50,
      },
    ]

    await supabase.from("achievements").insert(achievements)

    // Создание профилей пользователей
    const userProfiles = [
      {
        name: "Сева",
        subjects: ["rus", "math_prof", "inf"],
        training_days: [2, 4], // Вторник и четверг
        study_goal_weekday: 3,
        study_goal_training: 2,
        study_goal_weekend: 5,
      },
      {
        name: "Ваня",
        subjects: ["rus", "math_prof", "inf"],
        training_days: [2, 4], // Вторник и четверг
        study_goal_weekday: null,
        study_goal_training: null,
        study_goal_weekend: null,
      },
      {
        name: "Леша",
        subjects: ["rus", "math_prof", "phys"],
        training_days: null,
        study_goal_weekday: null,
        study_goal_training: null,
        study_goal_weekend: null,
      },
    ]

    await supabase.from("user_profiles").insert(userProfiles)

    // Создание расписания для профиля "Сева"
    // 1. Создаем недели
    const currentDate = new Date()
    const weeks = [
      {
        title: "Неделя 1",
        start_date: formatDate(currentDate),
        end_date: formatDate(addDays(currentDate, 6)),
        user_profile_name: "Сева",
      },
      {
        title: "Неделя 2",
        start_date: formatDate(addDays(currentDate, 7)),
        end_date: formatDate(addDays(currentDate, 13)),
        user_profile_name: "Сева",
      },
      {
        title: "Неделя 3",
        start_date: formatDate(addDays(currentDate, 14)),
        end_date: formatDate(addDays(currentDate, 20)),
        user_profile_name: "Сева",
      },
    ]

    const { data: weeksData } = await supabase.from("weeks").insert(weeks).select()

    if (!weeksData) {
      throw new Error("Failed to create weeks")
    }

    // 2. Создаем дни для каждой недели
    for (const week of weeksData) {
      const startDate = new Date(week.start_date)
      const days = []

      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i)
        const dayOfWeek = date.getDay() // 0 - воскресенье, 1 - понедельник, ..., 6 - суббота

        // Определяем тип дня
        let dayType = "weekday"
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dayType = "weekend"
        } else if (dayOfWeek === 2 || dayOfWeek === 4) {
          // Вторник и четверг - дни тренировок
          dayType = "training"
        }

        // Добавляем день в массив
        days.push({
          week_id: week.id,
          date: formatDate(date),
          day_name: getDayName(dayOfWeek),
          day_type: dayType,
          user_profile_name: "Сева",
        })
      }

      const { data: daysData } = await supabase.from("days").insert(days).select()

      if (!daysData) {
        throw new Error("Failed to create days")
      }

      // 3. Создаем задачи для каждого дня
      for (const day of daysData) {
        const tasks = []
        const dayDate = new Date(day.date)
        const dayOfWeek = dayDate.getDay()

        // Разные задачи в зависимости от типа дня
        if (day.day_type === "weekend") {
          // Выходной день - больше задач
          tasks.push({
            day_id: day.id,
            time_of_day: "morning",
            description: "[РУС] Нарешка по русскому",
            duration: "2",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          tasks.push({
            day_id: day.id,
            time_of_day: "morning",
            description: "[МАТ] Нарешка по математике",
            duration: "2",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          tasks.push({
            day_id: day.id,
            time_of_day: "afternoon",
            description: "[ИНФ] Сложное программирование",
            duration: "2",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          // Добавляем пробник в воскресенье
          if (dayOfWeek === 0) {
            tasks.push({
              day_id: day.id,
              time_of_day: "afternoon",
              description: "[ФУЛЛ пробник рус]",
              duration: "3.5",
              is_completed: false,
              is_exam: true,
              user_profile_name: "Сева",
            })
          }
        } else if (day.day_type === "training") {
          // День тренировки - меньше задач
          tasks.push({
            day_id: day.id,
            time_of_day: "morning",
            description: "[РУС] Нарешка по русскому",
            duration: "1.5",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          // Добавляем пробник во вторник
          if (dayOfWeek === 2) {
            tasks.push({
              day_id: day.id,
              time_of_day: "afternoon",
              description: "[МАТ] Пробник часть 1",
              duration: "1.5",
              is_completed: false,
              is_exam: true,
              user_profile_name: "Сева",
            })
          }
        } else {
          // Обычный будний день
          tasks.push({
            day_id: day.id,
            time_of_day: "morning",
            description: "[МАТ] Нарешка по математике",
            duration: "1.5",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          tasks.push({
            day_id: day.id,
            time_of_day: "afternoon",
            description: "[ИНФ] Нарешка по информатике",
            duration: "1.5",
            is_completed: false,
            is_exam: false,
            user_profile_name: "Сева",
          })

          // Добавляем пробник в пятницу
          if (dayOfWeek === 5) {
            tasks.push({
              day_id: day.id,
              time_of_day: "afternoon",
              description: "[ИНФ] Пробник часть 2",
              duration: "2",
              is_completed: false,
              is_exam: true,
              user_profile_name: "Сева",
            })
          }
        }

        if (tasks.length > 0) {
          await supabase.from("tasks").insert(tasks)
        }
      }
    }

    // Создаем начальную статистику для профиля "Сева"
    await supabase.from("user_stats").insert({
      total_tasks: 0,
      completed_tasks: 0,
      streak_days: 0,
      points: 0,
      level: 1,
      last_activity_date: formatDate(currentDate),
      user_profile_name: "Сева",
    })

    // Добавляем несколько задач в список дел
    const todoItems = [
      {
        text: "Записаться на пробный ЕГЭ по русскому",
        is_completed: false,
        user_profile_name: "Сева",
      },
      {
        text: "Купить сборник задач по математике",
        is_completed: false,
        user_profile_name: "Сева",
      },
      {
        text: "Повторить теорию по информатике",
        is_completed: false,
        user_profile_name: "Сева",
      },
    ]

    await supabase.from("todo_items").insert(todoItems)

    return NextResponse.json({ success: true, message: "Данные успешно загружены" })
  } catch (error) {
    console.error("Ошибка при инициализации данных:", error)
    return NextResponse.json({ error: "Ошибка при инициализации данных", details: error }, { status: 500 })
  }
}

// Вспомогательные функции для работы с датами
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getDayName(dayOfWeek: number): string {
  const dayNames = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
  return dayNames[dayOfWeek]
}
