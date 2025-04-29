import { Suspense } from "react"
import { getServerClient } from "@/lib/supabase"
import { getProfileFromCookies } from "@/lib/profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ExamsList } from "@/components/exams-list"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ExamsPage() {
  const supabase = getServerClient()
  const profileName = getProfileFromCookies()

  // Если профиль не выбран, показываем сообщение
  if (!profileName) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Пробники ЕГЭ</h1>
          <p className="text-muted-foreground">Отслеживайте результаты всех пробников</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не выбран</AlertTitle>
          <AlertDescription>Пожалуйста, выберите профиль для просмотра пробников.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get all exam tasks с учетом профиля
  const { data: examTasks } = await supabase
    .from("tasks")
    .select("*, day:day_id(*)")
    .eq("is_exam", true)
    .eq("user_profile_name", profileName)
    .order("day_id", { ascending: true })

  // Group exams by subject
  const russianExams =
    examTasks?.filter((task) => task.description.includes("[РУС") || task.description.includes("[ФУЛЛ пробник рус]")) ||
    []

  const mathExams =
    examTasks?.filter((task) => task.description.includes("[МАТ") || task.description.includes("[ФУЛЛ пробник мат]")) ||
    []

  const infoExams =
    examTasks?.filter((task) => task.description.includes("[ИНФ") || task.description.includes("[ФУЛЛ пробник инф]")) ||
    []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Пробники ЕГЭ</h1>
        <p className="text-muted-foreground">Отслеживайте результаты всех пробников</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b rounded-none">
                <TabsTrigger
                  value="all"
                  className="flex-1 sm:flex-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                >
                  Все пробники
                </TabsTrigger>
                <TabsTrigger
                  value="russian"
                  className="flex-1 sm:flex-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                >
                  Русский язык
                </TabsTrigger>
                <TabsTrigger
                  value="math"
                  className="flex-1 sm:flex-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                >
                  Математика
                </TabsTrigger>
                <TabsTrigger
                  value="info"
                  className="flex-1 sm:flex-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
                >
                  Информатика
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="all" className="mt-0">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <ExamsList exams={examTasks || []} title="Все пробники" />
                </Suspense>
              </TabsContent>

              <TabsContent value="russian" className="mt-0">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <ExamsList exams={russianExams} title="Пробники по русскому языку" />
                </Suspense>
              </TabsContent>

              <TabsContent value="math" className="mt-0">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <ExamsList exams={mathExams} title="Пробники по математике" />
                </Suspense>
              </TabsContent>

              <TabsContent value="info" className="mt-0">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <ExamsList exams={infoExams} title="Пробники по информатике" />
                </Suspense>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
