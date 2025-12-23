import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()

    const { data: activities, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json(activities)
  } catch (error) {
    console.error("[v0] Error fetching activity log:", error)
    return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 })
  }
}
