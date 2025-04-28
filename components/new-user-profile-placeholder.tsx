"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Construction } from "lucide-react"

interface NewUserProfilePlaceholderProps {
  onBack: () => void
}

export function NewUserProfilePlaceholder({ onBack }: NewUserProfilePlaceholderProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Новый ученик</CardTitle>
        <CardDescription className="text-center">Создание нового профиля находится в разработке</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Construction className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-center text-gray-500">
          Функция создания нового профиля ученика будет доступна в следующих версиях приложения.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к выбору профиля
        </Button>
      </CardFooter>
    </Card>
  )
}
