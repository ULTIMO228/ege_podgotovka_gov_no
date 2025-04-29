"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProfileProvider } from "@/context/ProfileContext"
import { PasswordLogin } from "@/components/password-login"
import { ProfileSelector } from "@/components/profile-selector"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { getBrowserClient } from "@/lib/supabase"

// Константы
const AUTH_COOKIE_NAME = "ege_auth"
const PROFILE_COOKIE_NAME = "selectedProfile"
const AUTH_STORAGE_KEY = "ege_auth"
const PROFILE_STORAGE_KEY = "selectedProfile"
const SETTINGS_SHOWN_KEY = "settings_shown"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem(AUTH_STORAGE_KEY)
      const profileName = localStorage.getItem(PROFILE_STORAGE_KEY)

      if (authStatus === "true") {
        setIsAuthenticated(true)
        if (profileName) {
          setSelectedProfile(profileName)
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Проверка необходимости показа настроек профиля
  useEffect(() => {
    const checkProfileSettings = async () => {
      if (!selectedProfile) return

      try {
        // Проверяем, были ли уже показаны настройки для этого профиля
        const settingsShownKey = `${SETTINGS_SHOWN_KEY}_${selectedProfile}`
        const settingsShown = localStorage.getItem(settingsShownKey)

        if (settingsShown === "true") return

        // Проверяем, заполнены ли цели обучения
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from("user_profiles")
          .select("study_goal_weekday, study_goal_training, study_goal_weekend")
          .eq("name", selectedProfile)
          .single()

        if (error) throw error

        // Если хотя бы одна цель не заполнена, показываем настройки
        if (data.study_goal_weekday === null || data.study_goal_training === null || data.study_goal_weekend === null) {
          setShowSettings(true)
        }

        // Отмечаем, что настройки были показаны
        localStorage.setItem(settingsShownKey, "true")
      } catch (error) {
        console.error("Error checking profile settings:", error)
      }
    }

    checkProfileSettings()
  }, [selectedProfile])

  // Обработчик успешной аутентификации
  const handleLoginSuccess = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true")
    setIsAuthenticated(true)

    // Устанавливаем cookie для серверной части
    document.cookie = `${AUTH_COOKIE_NAME}=true; path=/; max-age=2592000; SameSite=Lax` // 30 дней
  }

  // Обработчик выбора профиля
  const handleProfileSelect = (profileName: string) => {
    setIsLoading(true)

    // Сохраняем выбранный профиль
    localStorage.setItem(PROFILE_STORAGE_KEY, profileName)
    setSelectedProfile(profileName)

    // Устанавливаем cookie для серверной части
    document.cookie = `${PROFILE_COOKIE_NAME}=${profileName}; path=/; max-age=2592000; SameSite=Lax` // 30 дней

    // Перезагружаем страницу для применения профиля
    router.refresh()

    setIsLoading(false)
  }

  // Обработчик смены профиля
  const handleProfileSwitch = () => {
    setIsLoading(true)

    // Очищаем выбранный профиль
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    setSelectedProfile(null)

    // Удаляем cookie
    document.cookie = `${PROFILE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`

    // Перезагружаем страницу
    router.refresh()

    setIsLoading(false)
  }

  // Отображаем загрузчик
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-6">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  // Отображаем форму входа, если пользователь не аутентифицирован
  if (!isAuthenticated) {
    return <PasswordLogin onLoginSuccess={handleLoginSuccess} />
  }

  // Отображаем выбор профиля, если профиль не выбран
  if (!selectedProfile) {
    return <ProfileSelector onProfileSelect={handleProfileSelect} />
  }

  // Отображаем основное содержимое, если пользователь аутентифицирован и профиль выбран
  return (
    <ProfileProvider>
      {children}
      <ProfileSettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </ProfileProvider>
  )
}
