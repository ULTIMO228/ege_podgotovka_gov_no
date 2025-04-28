"use client"

import { useState, useEffect } from "react"
import { useProfileContext } from "@/components/auth-provider"
import { getBrowserClient } from "@/lib/supabase"
import { ProfileSettingsModal } from "@/components/profile-settings-modal"
import { useRouter } from "next/navigation"

export function ProfileGoalsChecker() {
  const { selectedProfile } = useProfileContext()
  const [needsGoals, setNeedsGoals] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkProfileGoals = async () => {
      if (!selectedProfile) return

      setIsChecking(true)
      try {
        const { data } = await getBrowserClient()
          .from("user_profiles")
          .select("study_goal_weekday, study_goal_training, study_goal_weekend")
          .eq("name", selectedProfile)
          .single()

        // Если все цели null, нужно запросить их
        if (data && data.study_goal_weekday === null && data.study_goal_weekend === null) {
          setNeedsGoals(true)
        } else {
          setNeedsGoals(false)
        }
      } catch (error) {
        console.error("Error checking profile goals:", error)
        setNeedsGoals(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkProfileGoals()
  }, [selectedProfile])

  // Обработчик сохранения целей
  const handleGoalsSaved = () => {
    setNeedsGoals(false)
    router.refresh() // Обновляем страницу, чтобы отобразить новые цели
  }

  if (isChecking || !needsGoals) {
    return null
  }

  return <ProfileSettingsModal open={needsGoals} onOpenChange={setNeedsGoals} onSettingsSaved={handleGoalsSaved} />
}
