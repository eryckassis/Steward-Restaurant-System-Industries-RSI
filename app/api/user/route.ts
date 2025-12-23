import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
      avatar_url: user.user_metadata?.avatar_url || null,
      email_verified: user.email_confirmed_at !== null,
      phone: user.user_metadata?.phone || null,
      two_factor_enabled: user.user_metadata?.two_factor_enabled || false,
    })
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const body = await request.json()

    const updateData: any = {}

    if (body.full_name !== undefined) {
      updateData.full_name = body.full_name
    }

    if (body.avatar_url !== undefined) {
      updateData.avatar_url = body.avatar_url
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: updateData,
      })

      if (updateError) {
        console.error("User update error:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    // Update email if provided (requires confirmation)
    if (body.email && body.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: body.email,
      })

      if (emailError) {
        console.error("Email update error:", emailError)
        return NextResponse.json({ error: emailError.message }, { status: 500 })
      }

      return NextResponse.json({
        message: "Email de confirmação enviado. Verifique sua caixa de entrada.",
        email_change_pending: true,
      })
    }

    // Get updated user data
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
      two_factor_enabled: updatedUser?.user_metadata?.two_factor_enabled || false,
    })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
