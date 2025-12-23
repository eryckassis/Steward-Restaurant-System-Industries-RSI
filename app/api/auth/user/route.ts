import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      restaurantName: user.user_metadata?.restaurant_name || "",
      createdAt: user.created_at,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}
