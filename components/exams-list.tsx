"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { updateTaskScore, toggleTaskCompletion } from "@/app/actions"
import { ChevronDown, ChevronRight, Plus, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { format, endOfDay, startOfDay, isAfter, isBefore, isEqual, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"

// --- Типизация данных ---
interface Exam {
  id: number
  description: string
  score: number | null
  is_completed: boolean
  day: {
    date: string // Ожидается строка в формате YYYY-MM-DD или ISO
    // ... другие поля day, если есть
  }
  // ... другие поля exam, если есть
}

interface ExamsListProps {
  exams: Exam[] // Используем типизацию
  title: string
}

// --- Хелперы Форматирования и Логики ---
const formatDate = (dateString: string): string => {
  try {
    // Используем parseISO для надежности парсинга разных форматов ISO
    const date = parseISO(dateString)
    return format(date, "d MMMM yyyy", { locale: ru })
  } catch (error) {
    console.error("Invalid date format:", dateString)
    return "Неверная дата"
  }
}

const getDayOfWeek = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, "EEEE", { locale: ru }) // Полное название дня недели
  } catch (error) {
    return ""
  }
}

// Логика определения предмета и типа
const getSubject = (description: string) => {
  if (description?.toLowerCase().includes("рус")) return "Русский язык"
  if (description?.toLowerCase().includes("мат")) return "Математика"
  if (description?.toLowerCase().includes("инф")) return "Информатика"
  return "Неизвестно"
}

const getExamType = (description: string) => {
  const lowerDesc = description?.toLowerCase() ?? ""
  if (lowerDesc.includes("фулл пробник")) return "Полный"
  if (lowerDesc.includes("соч пробник") || lowerDesc.includes("сочинение")) return "Сочинение"
  if (lowerDesc.includes("1ч пробник")) return "Часть 1"
  if (lowerDesc.includes("пробник 1")) return "Вариант 1"
  if (lowerDesc.includes("пробник 2")) return "Вариант 2"
  return "Стандартный"
}

// Цвет Badge в зависимости от балла
const getScoreBadgeVariant = (
  score: number | null | undefined,
): "success" | "warning" | "default" | "destructive" | "outline" => {
  if (score === null || score === undefined) return "outline"
  if (score >= 85) return "success"
  if (score >= 75) return "warning"
  if (score >= 60) return "default"
  return "destructive"
}

// Фон карточки
const getCardBackground = (exam: Exam): string => {
  const today = startOfDay(new Date()) // Начало сегодняшнего дня
  try {
    const examDate = startOfDay(parseISO(exam.day.date)) // Начало дня экзамена

    // Выделяем сегодняшний день особо
    if (isEqual(examDate, today)) {
      return "border-primary bg-primary/5 dark:bg-primary/10" // Яркая рамка для сегодня
    }

    if (exam.is_completed) {
      return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30" // Фон и рамка для выполненных
    }

    // Прошедшие, но не выполненные
    if (isBefore(examDate, today) && !exam.is_completed) {
      return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30" // Фон и рамка для просроченных
    }

    // Стандартный фон для будущих невыполненных
    return "bg-card border"
  } catch (error) {
    return "bg-card border" // Фоллбэк на случай ошибки с датой
  }
}

// --- Основной Компонент Списка ---
export function ExamsList({ exams: initialExams, title }: ExamsListProps) {
  const router = useRouter()

  // --- Состояния Компонента ---
  const [pendingScores, setPendingScores] = React.useState<Set<number>>(new Set()) // Используем Set для удобства
  const [pendingStatus, setPendingStatus] = React.useState<Set<number>>(new Set())
  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({})
  const [startDate, setStartDate] = React.useState<Date | null>(null)
  const [endDate, setEndDate] = React.useState<Date | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  // Состояние для формы создания (пример)
  const [newExamData, setNewExamData] = React.useState({
    date: new Date(),
    subject: "Русский язык",
    type: "Стандартный",
    description: "",
    score: "",
    isCompleted: false,
  })

  // Обработчик изменения диапазона дат
  const handleRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  // --- Фильтрация и Группировка Данных ---
  const filteredAndGroupedExams = useMemo(() => {
    // 1. Фильтрация по дате
    const filtered = initialExams.filter((exam) => {
      try {
        const examDate = parseISO(exam.day.date) // Убедимся, что парсинг прошел

        if (!startDate) return true // Нет фильтра - все показываем

        const fromDate = startOfDay(startDate)
        // Если есть 'endDate', берем endOfDay, иначе считаем диапазон одним днем 'startDate'
        const toDate = endDate ? endOfDay(endDate) : endOfDay(startDate)

        // Проверка попадания в диапазон (включительно)
        return !isBefore(examDate, fromDate) && !isAfter(examDate, toDate)
      } catch (error) {
        console.error("Skipping exam due to invalid date:", exam.day.date, exam)
        return false // Исключаем экзамены с невалидной датой
      }
    })

    // 2. Группировка по дате (YYYY-MM-DD)
    const groups = new Map<string, { date: Date; items: Exam[] }>()
    filtered.forEach((exam) => {
      try {
        const examDate = parseISO(exam.day.date)
        const dayKey = format(examDate, "yyyy-MM-dd") // Ключ для группы
        if (!groups.has(dayKey)) {
          groups.set(dayKey, { date: startOfDay(examDate), items: [] })
        }
        groups.get(dayKey)!.items.push(exam)
      } catch (error) {
        // Ошибку с датой уже обработали при фильтрации
      }
    })

    // 3. Сортировка групп по дате (по возрастанию - сначала старые)
    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [initialExams, startDate, endDate]) // Пересчет при изменении данных или диапазона

  // --- Обработчики Действий ---
  const handleScoreChange = async (examId: number, scoreStr: string) => {
    const score = Number.parseInt(scoreStr, 10)
    if (isNaN(score) || score < 0 || score > 100) {
      toast({ title: "Неверное значение", description: "Баллы должны быть от 0 до 100", variant: "destructive" })
      return
    }

    setPendingScores((prev) => new Set(prev).add(examId)) // Добавляем в Set
    try {
      await updateTaskScore(examId, score)
      toast({ title: "Баллы обновлены", description: `Результат: ${score}` })
      router.refresh() // Обновляем данные страницы
    } catch (error) {
      console.error("Score update error:", error)
      toast({ title: "Ошибка обновления баллов", variant: "destructive" })
    } finally {
      setPendingScores((prev) => {
        const next = new Set(prev)
        next.delete(examId) // Удаляем из Set
        return next
      })
    }
  }

  const handleStatusChange = async (examId: number, isCompleted: boolean) => {
    setPendingStatus((prev) => new Set(prev).add(examId))
    try {
      await toggleTaskCompletion(examId, isCompleted)
      toast({ title: "Статус обновлен", description: isCompleted ? "Выполнен" : "Не выполнен" })
      router.refresh()
    } catch (error) {
      console.error("Status update error:", error)
      toast({ title: "Ошибка обновления статуса", variant: "destructive" })
    } finally {
      setPendingStatus((prev) => {
        const next = new Set(prev)
        next.delete(examId)
        return next
      })
    }
  }

  // Переключение состояния папки
  const toggleFolder = (dateKey: string) => {
    setOpenFolders((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }))
  }

  // Развернуть/Свернуть все
  const expandAll = () => {
    const allOpen = filteredAndGroupedExams.reduce(
      (acc, group) => {
        acc[format(group.date, "yyyy-MM-dd")] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setOpenFolders(allOpen)
  }
  const collapseAll = () => setOpenFolders({})

  // Обработчик создания (пример)
  const handleCreateExam = async () => {
    console.log("Creating exam:", newExamData)
    // Здесь должна быть логика отправки данных на бэкенд
    // await createExamAction(newExamData);
    toast({ title: "Пробник создан (симуляция)" })
    setIsCreateDialogOpen(false)
    router.refresh() // Обновить данные после создания
    // Сброс формы
    setNewExamData({
      date: new Date(),
      subject: "Русский язык",
      type: "Стандартный",
      description: "",
      score: "",
      isCompleted: false,
    })
  }

  // --- РЕНДЕРИНГ КОМПОНЕНТА ---
  if (!initialExams || initialExams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          Нет доступных пробников для отображения.
          {/* Можно добавить кнопку "Создать пробник" здесь */}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* --- Шапка с Фильтром и Кнопками --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Левая часть: Фильтр и управление папками */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <div className="w-full sm:w-60">
            {" "}
            {/* Фиксированная ширина для DatePicker */}
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onRangeChange={handleRangeChange}
              placeholder="Фильтр по дате"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} disabled={filteredAndGroupedExams.length === 0}>
              Развернуть
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} disabled={filteredAndGroupedExams.length === 0}>
              Свернуть
            </Button>
          </div>
        </div>

        {/* Правая часть: Кнопка Создать */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Создать пробник
            </Button>
          </DialogTrigger>
          {/* --- Диалог Создания Пробника (упрощенный) --- */}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новый пробник</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Поля формы... (оставлю как было, но можно улучшить) */}
              {/* Пример поля даты с использованием DatePicker */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-exam-date" className="text-right">
                  Дата
                </Label>
                <div className="col-span-3">
                  {/* Используем новый DateRangeFilter для выбора одной даты */}
                  <DateRangeFilter
                    startDate={newExamData.date}
                    endDate={newExamData.date}
                    onRangeChange={(start) => setNewExamData({ ...newExamData, date: start ?? new Date() })}
                    placeholder="Выберите дату"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exam-subject" className="text-right">
                  Предмет
                </Label>
                <Select
                  value={newExamData.subject}
                  onValueChange={(value) => setNewExamData({ ...newExamData, subject: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Русский язык">Русский язык</SelectItem>
                    <SelectItem value="Математика">Математика</SelectItem>
                    <SelectItem value="Информатика">Информатика</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* ... остальные поля ... */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exam-score" className="text-right">
                  Баллы
                </Label>
                <Input
                  id="exam-score"
                  type="number"
                  min="0"
                  max="100"
                  value={newExamData.score}
                  onChange={(e) => setNewExamData({ ...newExamData, score: e.target.value })}
                  className="col-span-3"
                  placeholder="0-100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exam-status" className="text-right">
                  Статус
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="exam-status"
                    checked={newExamData.isCompleted}
                    onCheckedChange={(checked) => setNewExamData({ ...newExamData, isCompleted: checked === true })}
                  />
                  <label htmlFor="exam-status" className="text-sm font-medium">
                    Выполнен
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateExam}>Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Список Папок с Экзаменами --- */}
      <div className="space-y-4">
        {filteredAndGroupedExams.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-6 text-center text-muted-foreground">
              Нет пробников, соответствующих выбранному диапазону дат.
            </CardContent>
          </Card>
        ) : (
          filteredAndGroupedExams.map((group) => {
            const dateKey = format(group.date, "yyyy-MM-dd")
            const isOpen = openFolders[dateKey] || false
            const dayOfWeek = getDayOfWeek(dateKey) // Получаем день недели

            return (
              <div key={dateKey} className="rounded-lg overflow-hidden border border-border">
                {/* --- Заголовок Папки --- */}
                <button
                  className={cn(
                    "w-full flex items-center justify-between p-3 text-left transition-colors",
                    "bg-muted/50 hover:bg-muted", // Фон заголовка
                  )}
                  onClick={() => toggleFolder(dateKey)}
                  aria-expanded={isOpen}
                  aria-controls={`folder-content-${dateKey}`}
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <span className="font-medium text-sm sm:text-base">{formatDate(dateKey)}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{dayOfWeek}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.items.length}</Badge>
                </button>

                {/* --- Содержимое Папки (Карточки) --- */}
                {isOpen && (
                  <div
                    id={`folder-content-${dateKey}`}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-background" // Адаптивная сетка
                  >
                    {group.items.map((exam) => (
                      <Card key={exam.id} className={cn("flex flex-col", getCardBackground(exam))}>
                        {" "}
                        {/* Фон и рамка */}
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <CardTitle className="text-base font-semibold">{getSubject(exam.description)}</CardTitle>
                              <p className="text-xs text-muted-foreground">{getExamType(exam.description)}</p>
                            </div>
                            <Badge variant={exam.is_completed ? "success" : "outline"} className="text-xs shrink-0">
                              {exam.is_completed ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                              {exam.is_completed ? "Сдан" : "Не сдан"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                          {exam.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{exam.description}</p>
                          )}
                          {/* Поле ввода баллов */}
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`score-${exam.id}`} className="text-xs font-medium shrink-0">
                              Баллы:
                            </Label>
                            <Input
                              id={`score-${exam.id}`}
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={exam.score ?? ""} // Используем defaultValue для неконтролируемого ввода с возможностью обновления
                              onBlur={(e) => {
                                // Обновляем по потере фокуса
                                // Проверяем, изменилось ли значение
                                if (String(exam.score ?? "") !== e.target.value) {
                                  handleScoreChange(exam.id, e.target.value)
                                }
                              }}
                              onKeyDown={(e) => {
                                // Обновляем по Enter
                                if (e.key === "Enter") {
                                  if (String(exam.score ?? "") !== e.currentTarget.value) {
                                    handleScoreChange(exam.id, e.currentTarget.value)
                                  }
                                }
                              }}
                              disabled={pendingScores.has(exam.id)}
                              className="w-20 h-8 text-sm"
                              placeholder="0-100"
                            />
                            {exam.score !== null && exam.score !== undefined && (
                              <Badge variant={getScoreBadgeVariant(exam.score)} className="text-xs">
                                {exam.score}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t mt-auto">
                          {" "}
                          {/* Прижимаем футер к низу */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${exam.id}`}
                              checked={exam.is_completed}
                              onCheckedChange={(checked) => handleStatusChange(exam.id, Boolean(checked))}
                              disabled={pendingStatus.has(exam.id)}
                            />
                            <Label
                              htmlFor={`status-${exam.id}`}
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              {exam.is_completed ? "Выполнен" : "Отметить как выполненный"}
                            </Label>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
