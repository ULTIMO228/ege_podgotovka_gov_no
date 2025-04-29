import { TodoList } from "@/components/todo-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProfileFromCookies } from "@/lib/profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function TodosPage() {
  const profileName = getProfileFromCookies()

  // Если профиль не выбран, показываем сообщение
  if (!profileName) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Дополнительные задачи</h1>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Профиль не выбран</AlertTitle>
          <AlertDescription>Пожалуйста, выберите профиль для просмотра и управления задачами.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Дополнительные задачи</h1>

      <Card>
        <CardHeader>
          <CardTitle>Список задач</CardTitle>
          <CardDescription>Управляйте своими дополнительными задачами</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoList />
        </CardContent>
      </Card>
    </div>
  )
}
