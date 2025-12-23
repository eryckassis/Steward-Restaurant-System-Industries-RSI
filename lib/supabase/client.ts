import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    // Return a dummy object that won't break during SSR
    return null
  }

  // Return existing client if already created
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase environment variables")
    return null
  }

  try {
    client = createBrowserClient(supabaseUrl, supabaseKey)
    return client
  } catch (error) {
    console.error("[v0] Error creating Supabase client:", error)
    return null
  }
}
