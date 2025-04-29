import { cookies } from "next/headers"

// Константа для имени cookie
export const PROFILE_COOKIE_NAME = "selectedProfile"

// Функция для получения имени профиля из cookies на сервере
export function getProfileFromCookies(): string | null {
  const cookieStore = cookies()
  const profileCookie = cookieStore.get(PROFILE_COOKIE_NAME)
  return profileCookie?.value || null
}

// Функция для проверки наличия профиля
export function hasProfile(): boolean {
  return getProfileFromCookies() !== null
}

// Функция для получения имени профиля с проверкой
export function getProfileName(): string {
  const profileName = getProfileFromCookies()
  if (!profileName) {
    throw new Error("Профиль не выбран")
  }
  return profileName
}
