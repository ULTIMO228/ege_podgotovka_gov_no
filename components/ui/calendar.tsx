"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import { ru } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  // --- Компонент Кастомного Дропдауна для Месяца/Года (без изменений) ---
  function CustomDropdown({ value, onChange, children }: DropdownProps) {
    const options = React.Children.toArray(children) as React.ReactElement<React.HTMLProps<HTMLOptionElement>>[]
    const selected = options.find((child) => child.props.value === value)

    const handleValueChange = (selectedValue: string) => {
      const event = { target: { value: selectedValue } } as React.ChangeEvent<HTMLSelectElement>
      onChange?.(event)
    }

    return (
      <Select
        value={value?.toString()}
        onValueChange={(value) => {
          if (value) handleValueChange(value)
        }}
      >
        <SelectTrigger className="h-8 border-none bg-transparent px-2 text-sm font-medium focus:ring-0">
          <SelectValue>{selected?.props?.children}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((option, i) => (
            <SelectItem
              key={`${option.props.value}-${i}`} // Добавлен индекс для уникальности ключа
              value={option.props.value?.toString() ?? ""}
            >
              {option.props.children}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  // -------------------------------------------------------------------

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={ru} // Локаль по умолчанию
      // Используем кастомный дропдаун
      components={{
        Dropdown: CustomDropdown,
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      // --- КЛАССЫ ДЛЯ СТИЛИЗАЦИИ ---
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Скрываем стандартный текст, используем дропдауны
        caption_dropdowns: "flex items-center gap-1", // Контейнер для дропдаунов
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          // Убираем стандартный фон :has([aria-selected]), будем управлять им через day_* классы
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
        ),
        // --- СТИЛИ ДЛЯ ЗЕЛЕНОГО ВЫДЕЛЕНИЯ ---
        day_selected: // Стиль для ОДНОЙ выбранной даты или КОНЕЧНЫХ точек диапазона
          "bg-green-600 text-primary-foreground hover:bg-green-600 hover:text-primary-foreground focus:bg-green-600 focus:text-primary-foreground",
        day_range_start: "day-range-start bg-green-600 text-primary-foreground rounded-l-md", // Начало диапазона
        day_range_end: "day-range-end bg-green-600 text-primary-foreground rounded-r-md", // Конец диапазона
        day_range_middle: // Дни ВНУТРИ диапазона
          "day-range-middle rounded-none bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 aria-selected:hover:bg-green-200 dark:aria-selected:hover:bg-green-900/40", // Светло-зеленый фон для промежутка
        // --- Остальные стили ---
        day_today: "bg-accent text-accent-foreground", // Сегодняшний день
        day_outside: // Дни вне текущего месяца
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames, // Позволяет переопределить стили из пропсов
      }}
      {...props} // Передаем остальные пропсы (mode, selected, onSelect и т.д.)
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
