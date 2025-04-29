import { getServerClient } from "@/lib/supabase"
import { getProfileFromCookies } from "@/lib/profile"
import { Award, Check, Calendar, Star, Trophy, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export async function Achievements() {
  const supabase = getServerClient()
  const profileName = getProfileFromCookies()

  // Если профиль не выбран, показываем сообщение
  if (!profileName) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Профиль не выбран</AlertTitle>
        <AlertDescription>Пожалуйста, выберите профиль для просмотра достижений.</AlertDescription>
      </Alert>
    )
  }

  // Get all achievements
  let { data: achievements } = await supabase.from("achievements").select("*")

  // Get user's unlocked achievements с учетом профиля
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_profile_name", profileName)

  if (!achievements || achievements.length === 0) {
    // Create default achievements if none exist
    await createDefaultAchievements(supabase)

    // Fetch again after creating
    const { data: newAchievements } = await supabase.from("achievements").select("*")
    achievements = newAchievements || []
  }

  // Убедимся, что у нас нет дубликатов, используя Set для уникальных id
  const uniqueAchievementIds = new Set()
  const uniqueAchievements =
    achievements?.filter((achievement) => {
      if (uniqueAchievementIds.has(achievement.id)) {
        return false
      }
      uniqueAchievementIds.add(achievement.id)
      return true
    }) || []

  const unlockedIds = userAchievements?.map((ua) => ua.achievement_id) || []

  // Get icon component based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "award":
        return <Award className="h-6 w-6" />
      case "check":
        return <Check className="h-6 w-6" />
      case "calendar":
        return <Calendar className="h-6 w-6" />
      case "star":
        return <Star className="h-6 w-6" />
      case "trophy":
        return <Trophy className="h-6 w-6" />
      case "zap":
        return <Zap className="h-6 w-6" />
      default:
        return <Award className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-4">
      {uniqueAchievements.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">Нет доступных достижений</div>
      ) : (
        <ul className="space-y-2">
          {uniqueAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id)

            return (
              <li
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-md ${isUnlocked ? "bg-primary/10" : "bg-muted/50"}`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getIcon(achievement.icon_name)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                </div>
                <div className="text-sm font-medium">
                  {isUnlocked ? (
                    <span className="text-primary">Разблокировано</span>
                  ) : (
                    <span>+{achievement.points} XP</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

async function createDefaultAchievements(supabase: any) {
  // Check if achievements already exist
  const { data: existingAchievements } = await supabase.from("achievements").select("*")

  if (existingAchievements && existingAchievements.length > 0) {
    return // Don't create if they already exist
  }

  const defaultAchievements = [
    {
      name: "First Task",
      description: "Выполните свою первую задачу",
      icon_name: "check",
      points: 10,
    },
    {
      name: "Task Master",
      description: "Выполните 10 задач",
      icon_name: "award",
      points: 20,
    },
    {
      name: "3-Day Streak",
      description: "Будьте активны 3 дня подряд",
      icon_name: "calendar",
      points: 15,
    },
    {
      name: "Week Warrior",
      description: "Будьте активны 7 дней подряд",
      icon_name: "trophy",
      points: 30,
    },
    {
      name: "Point Collector",
      description: "Наберите 100 очков",
      icon_name: "star",
      points: 25,
    },
    {
      name: "EGE Champion",
      description: "Достигните 5 уровня",
      icon_name: "zap",
      points: 50,
    },
  ]

  // Insert default achievements
  await supabase.from("achievements").insert(defaultAchievements)
}
