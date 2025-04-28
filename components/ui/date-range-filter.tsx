"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ru } from "date-fns/locale"
import { format, isEqual } from "date-fns"

// Вспомогательная функция для создания дат (месяц начинается с 1)
const createDate = (year: number, month: number, day: number): Date => {
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0) // Нормализуем время
  return date
}

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onRangeChange: (start: Date | null, end: Date | null) => void
  className?: string
  placeholder?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onRangeChange,
  className,
  placeholder = "Выберите период",
}: DateRangeFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentMonthDate, setCurrentMonthDate] = useState(startDate || new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate)
  const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate)

  // Синхронизируем локальные состояния с пропсами
  useEffect(() => {
    setLocalStartDate(startDate)
    setLocalEndDate(endDate)
  }, [startDate, endDate])

  // Функции для работы с календарем
  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay() // 0 = Воскресенье

  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()
  const numDays = daysInMonth(year, month)
  const firstDayIndex = firstDayOfMonth(year, month)

  // Обработчик клика по дате
  const handleDateClick = (day: number) => {
    const clickedDate = createDate(year, month + 1, day)

    if (!localStartDate || (localStartDate && localEndDate)) {
      // Начинаем новый выбор или сбрасываем
      setLocalStartDate(clickedDate)
      setLocalEndDate(null)
    } else if (localStartDate && !localEndDate) {
      // Выбираем конечную дату
      if (clickedDate < localStartDate) {
        setLocalEndDate(localStartDate)
        setLocalStartDate(clickedDate)
      } else {
        setLocalEndDate(clickedDate)
      }
    }
  }

  // Проверка, выбрана ли дата
  const isSelected = (dayDate: Date): boolean => {
    if (!localStartDate) return false
    if (localEndDate) {
      return (
        (dayDate >= localStartDate && dayDate <= localEndDate) ||
        isEqual(dayDate, localStartDate) ||
        isEqual(dayDate, localEndDate)
      )
    }
    return isEqual(dayDate, localStartDate)
  }

  // Проверка, является ли дата началом диапазона
  const isStart = (dayDate: Date): boolean => !!localStartDate && isEqual(dayDate, localStartDate)

  // Проверка, является ли дата концом диапазона
  const isEnd = (dayDate: Date): boolean => !!localEndDate && isEqual(dayDate, localEndDate)

  // Проверка, находится ли дата в диапазоне
  const isInRange = (dayDate: Date): boolean => {
    if (localStartDate && localEndDate) {
      return dayDate > localStartDate && dayDate < localEndDate
    }
    if (localStartDate && !localEndDate && hoverDate) {
      const start = localStartDate < hoverDate ? localStartDate : hoverDate
      const end = localStartDate > hoverDate ? localStartDate : hoverDate
      return dayDate > start && dayDate < end
    }
    return false
  }

  // Изменение месяца
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonthDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setCurrentMonthDate(newDate)
  }

  // Применение фильтра
  const applyFilter = () => {
    onRangeChange(localStartDate, localEndDate)
    setIsCalendarOpen(false)
  }

  // Очистка фильтра
  const clearFilter = () => {
    setLocalStartDate(null)
    setLocalEndDate(null)
    onRangeChange(null, null)
    setIsCalendarOpen(false)
  }

  // Отображение выбранного диапазона
  const displayRange = React.useMemo(() => {
    if (!localStartDate) return placeholder
    if (localStartDate && !localEndDate) return `${format(localStartDate, "dd.MM.yyyy", { locale: ru })} - ...`
    return `${format(localStartDate, "dd.MM.yyyy", { locale: ru })} - ${format(localEndDate!, "dd.MM.yyyy", {
      locale: ru,
    })}`
  }, [localStartDate, localEndDate, placeholder])

  // Отрисовка дней календаря
  const renderDays = () => {
    const days = []
    // Пустые дни перед началом месяца
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10"></div>)
    }

    // Дни месяца
    for (let day = 1; day <= numDays; day++) {
      const dayDate = createDate(year, month + 1, day)
      const today = createDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
      const isToday = isEqual(dayDate, today)

      const dayClasses = cn(
        "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-150",
        {
          "bg-green-200 text-green-900": isSelected(dayDate) && !isStart(dayDate) && !isEnd(dayDate),
          "bg-green-500 text-white font-semibold": isStart(dayDate) || isEnd(dayDate),
          "rounded-r-none": isStart(dayDate) && !isEnd(dayDate),
          "rounded-l-none": !isStart(dayDate) && isEnd(dayDate),
          "rounded-full": isStart(dayDate) && isEnd(dayDate),
          "rounded-none": isInRange(dayDate),
          "hover:bg-gray-100 text-gray-700": !isSelected(dayDate) && !isInRange(dayDate),
          "border border-blue-500": isToday && !isSelected(dayDate),
        },
      )

      days.push(
        <div
          key={day}
          className={cn("relative flex justify-center items-center", {
            "bg-green-100": isInRange(dayDate),
            "bg-green-100 rounded-l-full": isStart(dayDate) && localEndDate,
            "bg-green-100 rounded-r-full": isEnd(dayDate),
          })}
        >
          <button
            className={dayClasses}
            onClick={() => handleDateClick(day)}
            onMouseEnter={() => setHoverDate(dayDate)}
            onMouseLeave={() => setHoverDate(null)}
          >
            {day}
          </button>
        </div>,
      )
    }
    return days
  }

  // Названия дней недели
  const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className={cn(
          "w-full justify-start text-left font-normal",
          !startDate && !endDate && "text-muted-foreground",
          startDate && "border-primary",
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span className="truncate">{displayRange}</span>
      </Button>

      {/* Отображение выбранного диапазона в виде Badge */}
      {startDate && (
        <div className="flex items-center justify-start mt-2">
          <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 text-sm font-medium">
            <span>{displayRange}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
              onClick={clearFilter}
              aria-label="Очистить фильтр"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      {isCalendarOpen && (
        <div className="absolute z-10 top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-full sm:w-80 select-none">
          <div className="flex justify-between items-center mb-3 px-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="font-semibold text-gray-800 text-sm">
              {format(currentMonthDate, "LLLL yyyy", { locale: ru })}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-gray-500 mb-2 font-medium">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-sm">{renderDays()}</div>
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={clearFilter} disabled={!localStartDate && !localEndDate}>
              Очистить
            </Button>
            <Button
              onClick={applyFilter}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Применить
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
