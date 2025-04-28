import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Создаем клиент для серверных компонентов
// Эта функция принимает cookieStore как параметр вместо импорта cookies
export function getServerClient(cookieStore?: { get: (name: string) => { value: string } | undefined }) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get(name)?.value
      },
    },
  })
}

// Создаем клиент для браузера (синглтон)
let browserClient: ReturnType<typeof createBrowserClient> | null = null

function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Экспортируем функцию для получения клиента в браузере
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}
