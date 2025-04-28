"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { PasswordLogin } from "@/components/password-login"
import { ProfileSelector } from "@/components/profile-selector"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPage } from "@/components/admin-page"

// Тип для статуса аутентификации
type AuthStatus = "none" | "user" | "admin"

// Создаем контекст для доступа к профилю из любого компонента
interface ProfileContextType {
  selectedProfile: string | null
  handleProfileSwitch: () => void
  handleProfileSelect: (profileName: string) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// Хук для использования контекста профиля
export function useProfileContext() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("none")
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем состояние из localStorage при монтировании
  useEffect(() => {
    const storedAuthStatus = localStorage.getItem("authStatus") as AuthStatus
    const storedProfile = localStorage.getItem("selectedProfile")

    if (storedAuthStatus === "user" || storedAuthStatus === "admin") {
      setAuthStatus(storedAuthStatus)
    } else {
      setAuthStatus("none") // Убедимся, что статус сброшен, если в localStorage мусор
    }

    if (storedProfile) {
      setSelectedProfile(storedProfile)
      // Устанавливаем cookie для доступа к профилю в Server Components
      document.cookie = `selectedProfile=${storedProfile}; path=/; max-age=2592000` // 30 дней
    }

    setIsLoading(false)
  }, [])

  // Обработчик успешного входа для обычного пользователя
  const handleUserLoginSuccess = () => {
    setAuthStatus("user")
    localStorage.setItem("authStatus", "user")
    // Профиль еще не выбран, selectedProfile остается null
  }

  // Обработчик успешного входа для администратора
  const handleAdminLoginSuccess = () => {
    setAuthStatus("admin")
    localStorage.setItem("authStatus", "admin")
    setSelectedProfile(null) // У админа нет "выбранного" профиля ученика по умолчанию
    localStorage.removeItem("selectedProfile")
    document.cookie = "selectedProfile=; path=/; max-age=0" // Очищаем cookie
  }

  // Обработчик выбора профиля
  const handleProfileSelect = (profileName: string) => {
    setSelectedProfile(profileName)
    localStorage.setItem("selectedProfile", profileName)
    // Устанавливаем cookie для доступа к профилю в Server Components
    document.cookie = `selectedProfile=${profileName}; path=/; max-age=2592000` // 30 дней
  }

  // Обработчик смены профиля
  const handleProfileSwitch = () => {
    setSelectedProfile(null)
    localStorage.removeItem("selectedProfile")
    // Удаляем cookie
    document.cookie = "selectedProfile=; path=/; max-age=0"
  }

  // Обработчик выхода из системы
  const handleLogout = () => {
    setAuthStatus("none")
    setSelectedProfile(null)
    localStorage.removeItem("authStatus")
    localStorage.removeItem("selectedProfile")
    // Удаляем cookie
    document.cookie = "selectedProfile=; path=/; max-age=0"
  }

  // Обработчик перехода к выбору профиля из админ-панели
  const handleNavigateToProfiles = () => {
    setAuthStatus("user")
    localStorage.setItem("authStatus", "user")
  }

  // Показываем загрузчик, пока проверяем localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  // Если пользователь не аутентифицирован, показываем форму входа
  if (authStatus === "none") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <PasswordLogin onUserLoginSuccess={handleUserLoginSuccess} onAdminLoginSuccess={handleAdminLoginSuccess} />
      </div>
    )
  }

  // Если это администратор, показываем страницу администратора
  if (authStatus === "admin") {
    return <AdminPage onNavigateToProfiles={handleNavigateToProfiles} />
  }

  // Если пользователь аутентифицирован, но профиль не выбран, показываем выбор профиля
  if (!selectedProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ProfileSelector onProfileSelect={handleProfileSelect} />
      </div>
    )
  }

  // Если пользователь аутентифицирован и профиль выбран, показываем основное приложение
  return (
    <ProfileContext.Provider
      value={{
        selectedProfile,
        handleProfileSwitch,
        handleProfileSelect,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
