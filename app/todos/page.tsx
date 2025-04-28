import { TodoList } from "@/components/todo-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TodosPage() {
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
