"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { NewUserProfilePlaceholder } from "@/components/new-user-profile-placeholder"
import { getBrowserClient } from "@/lib/supabase"
import { User, UserPlus, AlertCircle } from "lucide-react"

interface ProfileSelectorProps {
  onProfileSelect: (profileName: string) => void
}

export function ProfileSelector({ onProfileSelect }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<{ name: string }[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewUserPlaceholder, setShowNewUserPlaceholder] = useState(false)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setIsLoadingProfiles(true)
        const { data, error } = await getBrowserClient().from("user_profiles").select("name")

        if (error) {
          throw error
        }

        setProfiles(data || [])
      } catch (err) {
        console.error("Error fetching profiles:", err)
        setError("Не удалось загрузить профили")
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список профилей",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProfiles(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleProfileClick = (profileName: string) => {
    onProfileSelect(profileName)
    toast({
      title: "Профиль выбран",
      description: `Вы вошли как ${profileName}`,
    })
  }

  const handleNewUserClick = () => {
    setShowNewUserPlaceholder(true)
  }

  if (showNewUserPlaceholder) {
    return <NewUserProfilePlaceholder onBack={() => setShowNewUserPlaceholder(false)} />
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Выберите профиль</CardTitle>
        <CardDescription className="text-center">Выберите профиль ученика для работы с расписанием</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingProfiles ? (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        ) : error ? (
          <div className="text-center p-4 border border-red-200 rounded-md bg-red-50">
            <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Возможно, таблица user_profiles не существует или у вас нет прав доступа.
            </p>
          </div>
        ) : (
          <>
            {profiles.length === 0 ? (
              <div className="text-center p-4">
                <p>Нет доступных профилей</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <Button
                  key={profile.name}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleProfileClick(profile.name)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {profile.name}
                </Button>
              ))
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleNewUserClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Новый ученик
        </Button>
      </CardFooter>
    </Card>
  )
}
