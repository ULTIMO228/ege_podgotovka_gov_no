"use client"

import { useState, useEffect } from "react"

export function MoscowTime() {
  const [time, setTime] = useState<string>("")
  const [date, setDate] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      // Московское время (UTC+3)
      const now = new Date()
      const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60 * 1000))

      const hours = moscowTime.getHours().toString().padStart(2, "0")
      const minutes = moscowTime.getMinutes().toString().padStart(2, "0")
      const seconds = moscowTime.getSeconds().toString().padStart(2, "0")

      const day = moscowTime.getDate().toString().padStart(2, "0")
      const month = (moscowTime.getMonth() + 1).toString().padStart(2, "0")
      const year = moscowTime.getFullYear()

      setTime(`${hours}:${minutes}:${seconds}`)
      setDate(`${day}.${month}.${year}`)
    }

    // Обновляем время каждую секунду
    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-sm text-muted-foreground">
    </div>
  )
}
