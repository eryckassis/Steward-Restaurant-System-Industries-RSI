import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error: "Não autenticado" }
  }

  return { user, error: null }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
}

export async function requireAuth(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  return { userId: user.id, user }
}
