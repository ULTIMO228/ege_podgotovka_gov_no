"use client"

import { SeedSchedule } from "@/scripts/seed-schedule"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { getProfileFromCookies } from "@/lib/profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SeedPage() {
  const profileName = getProfileFromCookies()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Инициализация данных</h1>

      {!profileName ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не выбран</AlertTitle>
          <AlertDescription>
            Пожалуйста, выберите профиль для инициализации данных или вернитесь на страницу выбора профиля.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Загрузка данных расписания</CardTitle>
          <CardDescription>
            Нажмите кнопку ниже, чтобы загрузить начальные данные расписания в базу данных
            {profileName ? ` для профиля ${profileName}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeedSchedule />
        </CardContent>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Вернуться к выбору профиля
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
