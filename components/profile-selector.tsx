"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Users, UserPlus, Database } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { NewUserProfilePlaceholder } from "@/components/new-user-profile-placeholder"
import type { UserProfile } from "@/types/database"
import Link from "next/link"

interface ProfileSelectorProps {
  onProfileSelect: (profileName: string) => void
}

export function ProfileSelector({ onProfileSelect }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewProfileForm, setShowNewProfileForm] = useState(false)

  // Загрузка профилей
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase.from("user_profiles").select("*").order("name", { ascending: true })

        if (error) {
          throw error
        }

        setProfiles(data || [])
      } catch (error) {
        console.error("Ошибка при загрузке профилей:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список профилей",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Обработчик выбора профиля
  const handleProfileSelect = async () => {
    if (!selectedProfileId) {
      toast({
        title: "Выберите профиль",
        description: "Пожалуйста, выберите профиль для продолжения",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId)

      if (selectedProfile) {
        // Имитация задержки для UX
        await new Promise((resolve) => setTimeout(resolve, 500))
        onProfileSelect(selectedProfile.name)
      }
    } catch (error) {
      console.error("Ошибка при выборе профиля:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось выбрать профиль",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Отображение формы создания нового профиля
  if (showNewProfileForm) {
    return <NewUserProfilePlaceholder onBack={() => setShowNewProfileForm(false)} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Выбор профиля</CardTitle>
          <CardDescription className="text-center">Выберите профиль для работы с расписанием</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Профили не найдены</p>
              <Button className="mt-4" onClick={() => setShowNewProfileForm(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Создать новый профиль
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedProfileId === profile.id ? "default" : "outline"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedProfileId(profile.id)}
                >
                  {profile.name}
                </Button>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start text-left mt-4"
                onClick={() => setShowNewProfileForm(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Новый ученик
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" disabled={isSubmitting || !selectedProfileId} onClick={handleProfileSelect}>
            {isSubmitting ? "Загрузка..." : "Продолжить"}
          </Button>

          <Link href="/seed" className="w-full">
            <Button variant="outline" className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Инициализация данных
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
