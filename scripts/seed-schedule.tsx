"use client"

import { getBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useProfile } from "@/context/ProfileContext"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SeedSchedule() {
  const { selectedProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)

  const handleSeed = async () => {
    if (!selectedProfile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите профиль перед загрузкой данных",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const supabase = getBrowserClient()

      // 1. Очистка существующих данных
      await supabase.from("tasks").delete().neq("id", 0)
      await supabase.from("days").delete().neq("id", 0)
      await supabase.from("weeks").delete().neq("id", 0)
      await supabase.from("user_stats").delete().neq("id", 0)
      await supabase.from("user_achievements").delete().neq("id", 0)
      await supabase.from("user_profiles").delete().neq("id", 0)
      await supabase.from("activity_templates").delete().neq("id", 0)

      // 2. Создание шаблонов активностей
      await supabase.from("activity_templates").insert([
        {
          subject_key: "math",
          activity_key: "practice",
          description: "Математика: решение задач",
          default_duration: 2,
        },
        {
          subject_key: "math",
          activity_key: "exam",
          description: "Математика: пробный экзамен",
          default_duration: 4,
        },
        {
          subject_key: "math",
          activity_key: "theory",
          description: "Математика: изучение теории",
          default_duration: 1.5,
        },
        {
          subject_key: "russian",
          activity_key: "practice",
          description: "Русский язык: выполнение упражнений",
          default_duration: 1.5,
        },
        {
          subject_key: "russian",
          activity_key: "essay",
          description: "Русский язык: написание сочинения",
          default_duration: 1.5,
        },
        {
          subject_key: "russian",
          activity_key: "exam",
          description: "Русский язык: пробный экзамен",
          default_duration: 3.5,
        },
        {
          subject_key: "russian",
          activity_key: "theory",
          description: "Русский язык: изучение правил",
          default_duration: 1,
        },
        {
          subject_key: "informatics",
          activity_key: "programming",
          description: "Информатика: программирование",
          default_duration: 2,
        },
        {
          subject_key: "informatics",
          activity_key: "algorithms",
          description: "Информатика: алгоритмы",
          default_duration: 1.5,
        },
        {
          subject_key: "informatics",
          activity_key: "exam",
          description: "Информатика: пробный экзамен",
          default_duration: 4,
        },
        {
          subject_key: "informatics",
          activity_key: "theory",
          description: "Информатика: изучение теории",
          default_duration: 1,
        },
      ])

      // 3. Создание профилей пользователей
      await supabase.from("user_profiles").insert([
        {
          name: "Тестовый профиль",
          subjects: ["math", "russian", "informatics"],
          training_days: [1, 3, 5, 6], // monday, wednesday, friday, saturday
          study_goal_hours: 20,
          study_goal_tasks: 30,
          study_goal_exams: 5,
        },
        {
          name: "Сева",
          subjects: ["math", "russian", "informatics"],
          training_days: [1, 3, 5, 6], // monday, wednesday, friday, saturday
          study_goal_hours: 25,
          study_goal_tasks: 35,
          study_goal_exams: 7,
        },
        {
          name: "Ваня",
          subjects: ["math", "informatics"],
          training_days: [2, 4, 6], // tuesday, thursday, saturday
          study_goal_hours: 15,
          study_goal_tasks: 20,
          study_goal_exams: 3,
        },
        {
          name: "Леша",
          subjects: ["math", "russian"],
          training_days: [1, 3, 5], // monday, wednesday, friday
          study_goal_hours: 18,
          study_goal_tasks: 25,
          study_goal_exams: 4,
        },
      ])

      // 4. Создание расписания для профиля "Тестовый профиль"
      // Create weeks
      const { data: weeks } = await supabase
        .from("weeks")
        .insert([
          {
            title: "Неделя 1: 27 апреля – 3 мая",
            start_date: "2025-04-27",
            end_date: "2025-05-03",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Неделя 2: 4 мая – 10 мая",
            start_date: "2025-05-04",
            end_date: "2025-05-10",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Неделя 3: 11 мая – 17 мая",
            start_date: "2025-05-11",
            end_date: "2025-05-17",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Неделя 4: 18 мая – 24 мая",
            start_date: "2025-05-18",
            end_date: "2025-05-24",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Неделя 5: 25 мая – 31 мая",
            start_date: "2025-05-25",
            end_date: "2025-05-31",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Неделя 6: 1 июня – 7 июня",
            start_date: "2025-06-01",
            end_date: "2025-06-07",
            user_profile_name: "Тестовый профиль",
          },
          {
            title: "Последние дни: 8 июня – 11 июня",
            start_date: "2025-06-08",
            end_date: "2025-06-11",
            user_profile_name: "Тестовый профиль",
          },
        ])
        .select()

      if (!weeks) throw new Error("Failed to create weeks")

      // Создаем дни для каждой недели
      // Неделя 1: 27 апреля – 3 мая
      const week1Days = [
        {
          date: "2025-04-27",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-04-28",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-04-29",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-04-30",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-01",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-02",
          day_name: "Пт",
          day_type: "training",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-03",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[0].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week1DaysData } = await supabase.from("days").insert(week1Days).select()

      // Неделя 2: 4 мая – 10 мая
      const week2Days = [
        {
          date: "2025-05-04",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-05",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-06",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-07",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-08",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-09",
          day_name: "Пт",
          day_type: "training",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-10",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[1].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week2DaysData } = await supabase.from("days").insert(week2Days).select()

      // Неделя 3: 11 мая – 17 мая
      const week3Days = [
        {
          date: "2025-05-11",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-12",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-13",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-14",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-15",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-16",
          day_name: "Пт",
          day_type: "training",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-17",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[2].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week3DaysData } = await supabase.from("days").insert(week3Days).select()

      // Неделя 4: 18 мая – 24 мая
      const week4Days = [
        {
          date: "2025-05-18",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-19",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-20",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-21",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-22",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-23",
          day_name: "Пт",
          day_type: "training",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-24",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[3].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week4DaysData } = await supabase.from("days").insert(week4Days).select()

      // Неделя 5: 25 мая – 31 мая
      const week5Days = [
        {
          date: "2025-05-25",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-26",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-27",
          day_name: "Вт",
          day_type: "exam",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-28",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-29",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-30",
          day_name: "Пт",
          day_type: "exam",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-05-31",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[4].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week5DaysData } = await supabase.from("days").insert(week5Days).select()

      // Неделя 6: 1 июня – 7 июня
      const week6Days = [
        {
          date: "2025-06-01",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-02",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-03",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-04",
          day_name: "Ср",
          day_type: "training",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-05",
          day_name: "Чт",
          day_type: "weekday",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-06",
          day_name: "Пт",
          day_type: "training",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-07",
          day_name: "Сб",
          day_type: "weekend",
          week_id: weeks[5].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week6DaysData } = await supabase.from("days").insert(week6Days).select()

      // Последние дни: 8 июня – 11 июня
      const week7Days = [
        {
          date: "2025-06-08",
          day_name: "Вс",
          day_type: "weekend",
          week_id: weeks[6].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-09",
          day_name: "Пн",
          day_type: "weekday",
          week_id: weeks[6].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-10",
          day_name: "Вт",
          day_type: "weekday",
          week_id: weeks[6].id,
          user_profile_name: "Тестовый профиль",
        },
        {
          date: "2025-06-11",
          day_name: "Ср",
          day_type: "exam",
          week_id: weeks[6].id,
          user_profile_name: "Тестовый профиль",
        },
      ]

      const { data: week7DaysData } = await supabase.from("days").insert(week7Days).select()

      // 5. Создание расписания для профиля "Сева" (копирование структуры от "Тестовый профиль")
      // Копируем структуру недель
      for (const week of weeks) {
        const { data: newWeek } = await supabase
          .from("weeks")
          .insert({
            title: week.title,
            start_date: week.start_date,
            end_date: week.end_date,
            user_profile_name: "Сева",
          })
          .select()

        if (!newWeek || newWeek.length === 0) continue

        // Получаем дни для текущей недели из шаблона
        const { data: templateDays } = await supabase
          .from("days")
          .select("*")
          .eq("week_id", week.id)
          .eq("user_profile_name", "Тестовый профиль")
          .order("date", { ascending: true })

        if (!templateDays || templateDays.length === 0) continue

        // Создаем дни для новой недели
        for (const day of templateDays) {
          const { data: newDay } = await supabase
            .from("days")
            .insert({
              week_id: newWeek[0].id,
              date: day.date,
              day_name: day.day_name,
              day_type: day.day_type,
              user_profile_name: "Сева",
            })
            .select()
        }
      }

      // 6. Создание начальной статистики для всех профилей
      await supabase.from("user_stats").insert([
        {
          total_tasks: 0,
          completed_tasks: 0,
          streak_days: 0,
          points: 0,
          level: 1,
          user_profile_name: "Тестовый профиль",
        },
        {
          total_tasks: 0,
          completed_tasks: 0,
          streak_days: 0,
          points: 0,
          level: 1,
          user_profile_name: "Сева",
        },
        {
          total_tasks: 0,
          completed_tasks: 0,
          streak_days: 0,
          points: 0,
          level: 1,
          user_profile_name: "Ваня",
        },
        {
          total_tasks: 0,
          completed_tasks: 0,
          streak_days: 0,
          points: 0,
          level: 1,
          user_profile_name: "Леша",
        },
      ])

      // 7. Создание достижений
      await supabase.from("achievements").insert([
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
      ])

      toast({
        title: "Успех!",
        description: "Данные успешно инициализированы",
      })
    } catch (error: any) {
      console.error("Seed error:", error)
      toast({
        title: "Ошибка",
        description: `Не удалось инициализировать данные: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Профиль не выбран</AlertTitle>
        <AlertDescription>Пожалуйста, выберите профиль перед инициализацией данных.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label>Профиль:</Label>
        <div className="font-medium">{selectedProfile}</div>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Внимание!</AlertTitle>
        <AlertDescription>
          Эта операция удалит все существующие данные и создаст новые. Используйте только для инициализации системы.
        </AlertDescription>
      </Alert>
      <Button onClick={handleSeed} disabled={isLoading}>
        {isLoading ? "Инициализация данных..." : "Инициализировать данные"}
      </Button>
    </div>
  )
}
