"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Lock } from "lucide-react"

interface PasswordLoginProps {
  onUserLoginSuccess: () => void
  onAdminLoginSuccess: () => void
}

export function PasswordLogin({ onUserLoginSuccess, onAdminLoginSuccess }: PasswordLoginProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Имитация задержки сети
    setTimeout(() => {
      if (password === "Cu29Ni28") {
        onUserLoginSuccess()
        toast({
          title: "Успешный вход",
          description: "Выберите профиль ученика",
        })
      } else if (password === "admin000") {
        onAdminLoginSuccess()
        toast({
          title: "Вход администратора",
          description: "Добро пожаловать",
        })
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный пароль. Пожалуйста, попробуйте снова.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ЕГЭ Расписание</CardTitle>
        <CardDescription className="text-center">Введите пароль для доступа к системе</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Проверка..." : "Войти"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
