"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart, CheckSquare, Menu, X, BookOpen, FileBarChart } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { MoscowTime } from "@/components/moscow-time"
import { ProfileSwitcher } from "@/components/profile-switcher"

const routes = [
  {
    name: "Дашборд",
    path: "/",
    icon: <BarChart className="h-5 w-5 mr-2" />,
  },
  {
    name: "Расписание",
    path: "/schedule",
    icon: <Calendar className="h-5 w-5 mr-2" />,
  },
  {
    name: "Задачи",
    path: "/todos",
    icon: <CheckSquare className="h-5 w-5 mr-2" />,
  },
  {
    name: "Пробники",
    path: "/exams",
    icon: <BookOpen className="h-5 w-5 mr-2" />,
  },
  {
    name: "Отчеты",
    path: "/report",
    icon: <FileBarChart className="h-5 w-5 mr-2" />,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="font-bold text-lg" onClick={() => setOpen(false)}>
                  ЕГЭ Расписание
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                      pathname === route.path ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {route.icon}
                    {route.name}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-lg hidden md:flex">
          ЕГЭ Расписание
        </Link>

        <nav className="hidden lg:flex items-center space-x-4 lg:space-x-6 mx-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center text-sm font-medium transition-colors",
                pathname === route.path ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {route.icon}
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <MoscowTime />
          <ProfileSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
