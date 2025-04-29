"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Lock } from "lucide-react"

// Константа для пароля
const CORRECT_PASSWORD = "Cu29Ni28"

interface PasswordLoginProps {
  onLoginSuccess: () => void
}

export function PasswordLogin({ onLoginSuccess }: PasswordLoginProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Имитация задержки для безопасности
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в систему подготовки к ЕГЭ",
        })
        onLoginSuccess()
      } else {
        setAttempts(attempts + 1)
        toast({
          title: "Неверный пароль",
          description: "Пожалуйста, проверьте пароль и попробуйте снова",
          variant: "destructive",
        })
        setPassword("")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">График подготовки к ЕГЭ</CardTitle>
          <CardDescription className="text-center">Введите пароль для доступа к системе</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="text-center"
                autoComplete="current-password"
              />
              {attempts > 0 && (
                <p className="text-sm text-destructive text-center">Неверный пароль. Попыток: {attempts}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !password}>
              {isLoading ? "Проверка..." : "Войти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
