"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getBrowserClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface SeedScheduleProps {
  onComplete?: () => void
}

export function SeedSchedule({ onComplete }: SeedScheduleProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSeed = async () => {
    setIsLoading(true)
    try {
      // Создаем таблицы
      await createTables()

      // Заполняем данные
      await seedData()

      toast({
        title: "Успех",
        description: "Данные успешно загружены",
      })

      // Вызываем обратный вызов при завершении
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для создания таблиц
  const createTables = async () => {
    const supabase = getBrowserClient()

    // Создаем таблицу user_profiles, если она не существует
    await supabase.rpc("create_user_profiles_table")

    // Создаем таблицу activity_templates, если она не существует
    await supabase.rpc("create_activity_templates_table")

    // Добавляем колонку user_profile_name в существующие таблицы
    await supabase.rpc("add_user_profile_column_to_tables")
  }

  // Функция для заполнения данных
  const seedData = async () => {
    const supabase = getBrowserClient()

    // Заполняем таблицу activity_templates
    await supabase.rpc("seed_activity_templates")

    // Создаем профили пользователей
    await supabase.rpc("seed_user_profiles")

    // Заполняем данные для профиля "Сева"
    await supabase.rpc("seed_data_for_seva")
  }

  return (
    <Button onClick={handleSeed} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Загрузка данных...
        </>
      ) : (
        "Загрузить данные"
      )}
    </Button>
  )
}
