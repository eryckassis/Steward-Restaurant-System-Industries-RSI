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

    // Update user metadata to disable 2FA
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        two_factor_enabled: false,
        two_factor_method: null,
      },
    })

    if (updateError) {
      console.error("2FA disable error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Get updated user
    const {
      data: { user: updatedUser },
    } = await supabase.auth.getUser()

    return NextResponse.json({
      id: updatedUser?.id,
      email: updatedUser?.email,
      full_name: updatedUser?.user_metadata?.full_name || "",
      avatar_url: updatedUser?.user_metadata?.avatar_url || null,
      email_verified: updatedUser?.email_confirmed_at !== null,
      phone: updatedUser?.user_metadata?.phone || null,
      two_factor_enabled: false,
    })
  } catch (error) {
    console.error("2FA disable error:", error)
    return NextResponse.json({ error: "Erro ao desativar 2FA" }, { status: 500 })
  }
}
