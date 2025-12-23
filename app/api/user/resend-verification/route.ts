import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()

    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
    })

    if (error) {
      console.error("Resend verification error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Email de verificação reenviado com sucesso",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
}
