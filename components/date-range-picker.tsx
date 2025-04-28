"use client"

import * as React from "react"
import { format, isAfter } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Используем твой кастомизированный Calendar из первого/последнего блока
import { Calendar } from "@/components/ui/calendar" // Убедись, что путь правильный
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge" // Добавил импорт Badge

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ dateRange, setDateRange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  // Локальное состояние для предпросмотра выбора до нажатия "Применить"
  const [localDateRange, setLocalDateRange] = React.useState<DateRange | undefined>(dateRange)

  // Синхронизация локального состояния с внешним при изменении извне
  React.useEffect(() => {
    setLocalDateRange(dateRange)
  }, [dateRange])

  // Обработчик выбора дат в календаре
  const handleSelect = (range: DateRange | undefined) => {
    // Автоматически меняем местами, если дата начала выбрана позже даты конца
    if (range?.from && range?.to && isAfter(range.from, range.to)) {
      setLocalDateRange({
        from: range.to,
        to: range.from,
      })
    } else {
      setLocalDateRange(range)
    }
    // Не закрываем автоматически, даем пользователю нажать "Применить"
  }

  // Применение выбранного диапазона
  const handleApply = () => {
    setDateRange(localDateRange) // Обновляем внешнее состояние
    setIsOpen(false) // Закрываем поповер
  }

  // Очистка фильтра
  const handleClear = () => {
    setDateRange(undefined) // Очищаем внешнее состояние
    setLocalDateRange(undefined) // Очищаем локальное состояние
    setIsOpen(false) // Закрываем поповер
  }

  // Отмена выбора (просто закрыть поповер без применения)
  const handleCancel = () => {
    setLocalDateRange(dateRange) // Возвращаем локальное состояние к последнему примененному
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal", // Убрал фиксированную ширину, пусть растягивается по контейнеру
              !dateRange && "text-muted-foreground", // Серый текст если не выбрано
              dateRange && "border-primary", // Выделение рамкой, если выбрано
            )}
            onClick={() => setIsOpen(true)} // Открываем по клику
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd.MM.yyyy", { locale: ru })} -{" "}
                  {format(dateRange.to, "dd.MM.yyyy", { locale: ru })}
                </>
              ) : (
                // Если выбрана только начальная дата (маловероятно с Apply, но на всякий случай)
                format(dateRange.from, "dd.MM.yyyy", { locale: ru })
              )
            ) : (
              <span>Выберите период</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* Опционально: Заголовок и инструкция внутри поповера */}
          <div className="p-3 border-b">
             <h3 className="font-medium text-sm">Выберите диапазон дат</h3>
             <p className="text-xs text-muted-foreground mt-1">Сначала выберите начальную дату, затем конечную.</p>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={localDateRange?.from ?? dateRange?.from} // Начальный месяц
            selected={localDateRange} // Отображаем локальный выбор
            onSelect={handleSelect} // Обработчик выбора
            numberOfMonths={2} // Показываем 2 месяца для удобства выбора диапазона
            locale={ru} // Русская локаль из базового компонента
            className="border-b" // Добавил границу под календарем
            // classNames можно передать для доп. стилизации, если нужно
          />
          {/* Кнопки управления */}
          <div className="flex items-center justify-between p-3">
             {/* Кнопка очистки слева */}
             <Button variant="ghost" size="sm" onClick={handleClear} disabled={!localDateRange}>
               Очистить
             </Button>
             {/* Кнопки Отмена и Применить справа */}
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={handleCancel}>
                 Отмена
               </Button>
               <Button size="sm" onClick={handleApply} disabled={!localDateRange?.from || !localDateRange?.to}>
                 Применить
               </Button>
             </div>
           </div>
        </PopoverContent>
      </Popover>

      {/* Отображение выбранного диапазона в виде Badge под кнопкой */}
      {dateRange && (
        <div className="flex items-center justify-start"> {/* Обертка для позиционирования */}
            <Badge variant="outline" className="flex items-center gap-1 w-fit bg-primary/10 border-primary text-primary">
              <span>
                {format(dateRange.from, "dd MMM yyyy", { locale: ru })}
                {dateRange.to && ` - ${format(dateRange.to, "dd MMM yyyy", { locale: ru })}`}
              </span>
              {/* Маленькая кнопка для очистки прямо из Badge */}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-primary hover:text-destructive"
                onClick={handleClear} // Используем ту же функцию очистки
                aria-label="Очистить фильтр"
               >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
         </div>
      )}
    </div>
  )
}
