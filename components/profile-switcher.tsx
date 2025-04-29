"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { User, UserPlus, LogOut, Check } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { useProfile } from "@/context/ProfileContext"
import type { UserProfile } from "@/types/database"

export function ProfileSwitcher() {
  const { selectedProfile, selectProfile, clearProfile } = useProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  // Загрузка профилей при открытии диалога
  useEffect(() => {
    if (isOpen) {
      const fetchProfiles = async () => {
        setIsLoading(true)
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
    }
  }, [isOpen])

  // Обработчик переключения профиля
  const handleProfileSwitch = async (profileName: string) => {
    if (profileName === selectedProfile) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)

    try {
      // Имитация задержки для UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Сохраняем выбранный профиль
      localStorage.setItem("selectedProfile", profileName)

      // Устанавливаем cookie для серверной части
      document.cookie = `selectedProfile=${profileName}; path=/; max-age=2592000; SameSite=Lax` // 30 дней

      // Обновляем контекст
      selectProfile(profileName)

      toast({
        title: "Профиль изменен",
        description: `Вы переключились на профиль: ${profileName}`,
      })

      // Перезагружаем страницу для применения профиля
      window.location.reload()
    } catch (error) {
      console.error("Ошибка при переключении профиля:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось переключить профиль",
        variant: "destructive",
      })
    } finally {
      setIsSwitching(false)
      setIsOpen(false)
    }
  }

  // Обработчик выхода из системы
  const handleLogout = () => {
    // Очищаем данные аутентификации
    localStorage.removeItem("ege_auth")
    localStorage.removeItem("selectedProfile")

    // Удаляем cookies
    document.cookie = "ege_auth=; path=/; max-age=0; SameSite=Lax"
    document.cookie = "selectedProfile=; path=/; max-age=0; SameSite=Lax"

    // Очищаем контекст
    clearProfile()

    // Перезагружаем страницу
    window.location.reload()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <User className="h-5 w-5" />
            <span className="sr-only">Профиль</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Переключение профиля</DialogTitle>
            <DialogDescription>Выберите профиль для работы с расписанием</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <Button
                    key={profile.id}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isSwitching}
                    onClick={() => handleProfileSwitch(profile.name)}
                  >
                    <span>{profile.name}</span>
                    {selectedProfile === profile.name && <Check className="h-4 w-4 text-primary" />}
                  </Button>
                ))}

                <Button variant="ghost" className="w-full justify-start text-left mt-4" disabled={isSwitching}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Новый ученик
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" className="gap-2" onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения выхода */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подтверждение выхода</DialogTitle>
            <DialogDescription>Вы уверены, что хотите выйти из системы?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
