"use client"

import { SeedSchedule } from "@/scripts/seed-schedule"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SeedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showSkip = searchParams.get("showSkip") === "true"
  const [seedCompleted, setSeedCompleted] = useState(false)

  // Обработчик завершения загрузки данных
  const handleSeedComplete = () => {
    localStorage.setItem("seedCompleted", "true")
    setSeedCompleted(true)
  }

  // Обработчик пропуска загрузки данных
  const handleSkip = () => {
    router.push("/")
  }

  // Обработчик перехода к выбору профиля
  const goToProfileSelection = () => {
    router.push("/")
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Инициализация данных</h1>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка данных расписания</CardTitle>
          <CardDescription>
            Нажмите кнопку ниже, чтобы загрузить начальные данные расписания в базу данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeedSchedule onComplete={handleSeedComplete} />
        </CardContent>
        <CardFooter className="flex justify-between">
          {showSkip && !seedCompleted && (
            <Button variant="outline" onClick={handleSkip}>
              Пропустить
            </Button>
          )}
          {seedCompleted && <Button onClick={goToProfileSelection}>Перейти к выбору профиля</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
