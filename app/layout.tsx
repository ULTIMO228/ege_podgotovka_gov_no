import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { ProfileGoalsChecker } from "@/components/profile-goals-checker"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "График подготовки к ЕГЭ",
  description: "Интерактивное расписание для подготовки к ЕГЭ",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1 container py-6">{children}</main>
              <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                <div className="container">&copy; {new Date().getFullYear()} График подготовки к ЕГЭ</div>
              </footer>
            </div>
            <ProfileGoalsChecker />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
