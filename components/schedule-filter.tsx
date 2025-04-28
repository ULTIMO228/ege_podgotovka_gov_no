"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ScheduleFilter({ currentFilter }: { currentFilter: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleFilterChange = (value: string) => {
    router.push(`${pathname}?filter=${value}`)
  }

  return (
    <Select value={currentFilter} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Фильтр" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все дни</SelectItem>
        <SelectItem value="upcoming">Предстоящие</SelectItem>
        <SelectItem value="past">Прошедшие</SelectItem>
        <SelectItem value="today">Сегодня</SelectItem>
        <SelectItem value="weekend">Выходные</SelectItem>
        <SelectItem value="weekday">Будние</SelectItem>
        <SelectItem value="exam">Экзамены</SelectItem>
      </SelectContent>
    </Select>
  )
}
