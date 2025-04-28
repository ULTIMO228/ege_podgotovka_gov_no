"use client"

import { Trophy, Zap, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UserStats as UserStatsType } from "@/types/database"

export function UserStats({ stats }: { stats: UserStatsType }) {
  // Calculate progress to next level
  const currentLevelPoints = (stats.level - 1) * 100
  const nextLevelPoints = stats.level * 100
  const progressToNextLevel = ((stats.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div className="font-medium">Уровень</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.level}</div>
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1 flex justify-between">
              <span>Прогресс</span>
              <span>
                {stats.points} / {nextLevelPoints} XP
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <div className="font-medium">Очки</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.points}</div>
          <div className="mt-2 text-xs text-muted-foreground">+5 очков за каждую выполненную задачу</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <div className="font-medium">Серия дней</div>
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.streak_days}</div>
          <div className="mt-2 text-xs text-muted-foreground">+15 очков каждые 3 дня подряд</div>
        </CardContent>
      </Card>
    </div>
  )
}
