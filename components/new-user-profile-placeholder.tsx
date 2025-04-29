"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, ArrowLeft } from "lucide-react"

interface NewUserProfilePlaceholderProps {
  onBack: () => void
}

export function NewUserProfilePlaceholder({ onBack }: NewUserProfilePlaceholderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Новый ученик</CardTitle>
          <CardDescription className="text-center">Создание нового профиля ученика</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">Функция в разработке</p>
            <p className="text-muted-foreground">Создание новых профилей будет доступно в следующих обновлениях.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к выбору профиля
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
