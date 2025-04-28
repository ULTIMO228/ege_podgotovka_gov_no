"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProfileContext } from "@/components/auth-provider"
import { getBrowserClient } from "@/lib/supabase"
import { User, Users, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { NewUserProfilePlaceholder } from "@/components/new-user-profile-placeholder"

export function ProfileSwitcher() {
  const { selectedProfile, handleProfileSelect, handleProfileSwitch } = useProfileContext()
  const [isOpen, setIsOpen] = useState(false)
  const [profiles, setProfiles] = useState<{ name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<string | null>(null)
  const [showNewUserPlaceholder, setShowNewUserPlaceholder] = useState(false)

  // Загружаем профили при открытии диалога
  useEffect(() => {
    if (isOpen) {
      const fetchProfiles = async () => {
        setIsLoading(true)
        try {
          const { data } = await getBrowserClient().from("user_profiles").select("name")
          setProfiles(data || [])
        } catch (error) {
          console.error("Error fetching profiles:", error)
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить профили",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfiles()
    }
  }, [isOpen])

  // Обработчик смены профиля
  const handleSwitchProfile = async (profileName: string) => {
    if (profileName === selectedProfile) return

    setSwitchingTo(profileName)
    // Имитация загрузки для демонстрации UI
    await new Promise((resolve) => setTimeout(resolve, 500))
    handleProfileSelect(profileName)
    setSwitchingTo(null)
    setIsOpen(false)
    toast({
      title: "Профиль изменен",
      description: `Вы переключились на профиль: ${profileName}`,
    })
  }

  // Если показываем заглушку нового профиля
  if (showNewUserPlaceholder) {
    return (
      <Dialog open={true} onOpenChange={() => setShowNewUserPlaceholder(false)}>
        <DialogContent className="sm:max-w-md">
          <NewUserProfilePlaceholder onBack={() => setShowNewUserPlaceholder(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Сменить профиль">
        <User className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сменить профиль</DialogTitle>
            <DialogDescription>
              Вы вошли как: <span className="font-medium">{selectedProfile}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-2">
                {profiles
                  .filter((profile) => profile.name !== selectedProfile)
                  .map((profile) => (
                    <Button
                      key={profile.name}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleSwitchProfile(profile.name)}
                      disabled={switchingTo === profile.name}
                    >
                      {switchingTo === profile.name ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <User className="mr-2 h-5 w-5 text-primary" />
                      )}
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs text-muted-foreground">Ученик</div>
                      </div>
                    </Button>
                  ))}

                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => {
                    setIsOpen(false)
                    setShowNewUserPlaceholder(true)
                  }}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Новый ученик
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
