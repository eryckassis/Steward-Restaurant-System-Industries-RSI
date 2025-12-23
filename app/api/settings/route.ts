import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const supabase = await createClient()
  const authResult = await requireAuth(supabase)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { userId } = authResult

  try {
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error

    // If no settings exist, create default ones with correct schema columns
    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from("system_settings")
        .insert({
          user_id: userId,
          pdf_report_day: 1,
          high_contrast_mode: false,
          guided_mode: true,
          two_factor_enabled: false,
          two_factor_method: null,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[v0] Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const authResult = await requireAuth(supabase)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { userId } = authResult

  try {
    const updates = await request.json()

    const { data, error } = await supabase
      .from("system_settings")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
