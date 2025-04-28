import { Suspense } from "react"
import { cookies } from "next/headers"
import { getServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TodoList } from "@/components/todo-list"
import { UserStats } from "@/components/user-stats"
import { UpcomingTasks } from "@/components/upcoming-tasks"
import { Achievements } from "@/components/achievements"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = getServerClient(cookieStore)

  // Get user stats
  const { data: statsData } = await supabase.from("user_stats").select("*").limit(1)

  const stats = statsData?.[0] || {
    total_tasks: 0,
    completed_tasks: 0,
    streak_days: 0,
    points: 0,
    level: 1,
  }

  // Calculate completion percentage
  const completionPercentage = stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Прогресс подготовки к ЕГЭ</CardTitle>
              <CardDescription>Отслеживайте свой прогресс и достижения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Выполнено задач</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.completed_tasks} / {stats.total_tasks}
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
                  <UserStats stats={stats} />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-[350px]">
          <Tabs defaultValue="todo">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todo">Задачи</TabsTrigger>
              <TabsTrigger value="achievements">Достижения</TabsTrigger>
            </TabsList>
            <TabsContent value="todo" className="mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Дополнительные задачи</CardTitle>
                  <CardDescription>Управляйте своими дополнительными задачами</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                    <TodoList />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="achievements" className="mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Достижения</CardTitle>
                  <CardDescription>Ваши разблокированные достижения</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                    <Achievements />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Предстоящие задачи</CardTitle>
          <CardDescription>Задачи на ближайшие дни</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <UpcomingTasks />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
