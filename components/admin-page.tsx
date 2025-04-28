"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Database, UserCheck } from "lucide-react"

interface AdminPageProps {
  onNavigateToProfiles: () => void
}

export function AdminPage({ onNavigateToProfiles }: AdminPageProps) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Данные успешно загружены",
        description: "Начальные данные были успешно загружены в базу данных.",
      })
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error)
      toast({
        title: "Ошибка загрузки данных",
        description: "Произошла ошибка при загрузке начальных данных.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
      setDialogOpen(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Панель Администратора</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Инициализация данных</CardTitle>
            <CardDescription>
              Эта операция очистит текущие данные (шаблоны, профили, расписание Севы и т.д.) и загрузит начальные
              данные.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Будут созданы профили для Севы, Вани и Леши. Расписание будет создано только для профиля Севы.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Загрузить начальные данные
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Эта операция очистит все существующие данные и загрузит начальные данные. Это действие нельзя
                    отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeedData}>Продолжить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Управление профилями</CardTitle>
            <CardDescription>Перейдите к выбору профиля ученика для работы с приложением.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={onNavigateToProfiles}>
              <UserCheck className="mr-2 h-4 w-4" />
              Перейти к выбору профиля ученика
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
