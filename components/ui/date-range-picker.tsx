"use client"

import * as React from "react"
import { format, isAfter } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Используем ОБНОВЛЕННЫЙ Calendar с зеленым выделением
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface DateRangePickerProps {
  /** Текущий выбранный и примененный диапазон */
  appliedRange: DateRange | undefined
  /** Функция для обновления примененного диапазона */
  onRangeChange: (range: DateRange | undefined) => void
  /** Дополнительные классы для корневого div */
  className?: string
  /** Плейсхолдер для кнопки, когда ничего не выбрано */
  placeholder?: string
}

export function DateRangePicker({
  appliedRange,
  onRangeChange,
  className,
  placeholder = "Выберите период",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  // Локальное состояние для предпросмотра выбора ВНУТРИ поповера
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(appliedRange)

  // Синхронизируем draftRange, если appliedRange изменился извне
  React.useEffect(() => {
    setDraftRange(appliedRange)
  }, [appliedRange])

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange) {
      setDraftRange(undefined)
      return
    }
    // Гарантируем from <= to
    if (selectedRange.from && selectedRange.to && isAfter(selectedRange.from, selectedRange.to)) {
      setDraftRange({ from: selectedRange.to, to: selectedRange.from })
    } else {
      setDraftRange(selectedRange)
    }
    // Не закрываем автоматически, даем пользователю нажать "Применить"
  }

  const handleApply = () => {
    if (draftRange?.from && draftRange?.to) {
      onRangeChange(draftRange)
      setIsOpen(false)
    } else if (!draftRange?.from && !draftRange?.to && appliedRange) {
      // Если очистили выбор в календаре (draftRange стал undefined)
      handleClear() // Вызываем очистку
    } else if (draftRange?.from && !draftRange?.to) {
      // Если выбрана только дата начала и нажали Применить
      // Применяем диапазон из одного дня
      onRangeChange({ from: draftRange.from, to: draftRange.from })
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setDraftRange(appliedRange) // Возвращаем к последнему примененному
    setIsOpen(false)
  }

  const handleClear = () => {
    setDraftRange(undefined)
    onRangeChange(undefined) // Очищаем основное состояние
    setIsOpen(false)
  }

  // Форматирование для отображения в кнопке и Badge
  const formatDateDisplay = (date: Date | undefined): string => {
    return date ? format(date, "dd MMM yyyy", { locale: ru }) : ""
  }

  const displayValue = appliedRange?.from
    ? `${formatDateDisplay(appliedRange.from)}${appliedRange.to ? ` - ${formatDateDisplay(appliedRange.to)}` : ""}`
    : placeholder

  // Кнопка "Применить" активна, если выбрана хотя бы дата начала
  const isApplyDisabled = !draftRange?.from

  return (
    <div className={cn("grid gap-2", className)}>
      {/* --- Кнопка вызова календаря --- */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-trigger"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal",
              !appliedRange && "text-muted-foreground", // Серый цвет если не выбрано
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{displayValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* --- САМ КАЛЕНДАРЬ (ОДИН!) --- */}
          <Calendar
            initialFocus
            mode="range" // <--- Вот он, режим ОДНОГО календаря для диапазона
            defaultMonth={draftRange?.from ?? appliedRange?.from ?? new Date()}
            selected={draftRange} // Отображаем и изменяем draftRange
            onSelect={handleSelect} // Обработчик выбора дат
            numberOfMonths={2} // Показываем 2 месяца для удобства
            locale={ru}
            // disabled={{ before: new Date(2024, 0, 1) }} // Пример ограничения дат
          />
          {/* --- Кнопки управления --- */}
          <div className="flex items-center justify-between border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!draftRange && !appliedRange} // Неактивна если и так ничего не выбрано
            >
              Очистить
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={isApplyDisabled} // Нельзя применить без даты начала
              >
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* --- Badge с выбранным диапазоном (опционально) --- */}
      {appliedRange && (
        <div className="flex items-center justify-start">
          <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-2 text-sm font-medium">
            <span>{displayValue}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
              onClick={() => onRangeChange(undefined)} // Быстрая очистка
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
