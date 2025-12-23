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

    // Get all inventory items
    const { data: items, error: itemsError } = await supabase.from("inventory_items").select("*")

    if (itemsError) throw itemsError

    // Calculate stats
    const totalItems = items?.length || 0
    const lowStockCount = items?.filter((item) => item.quantity <= item.min_stock).length || 0
    const totalValue = items?.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0) || 0

    // Get waste data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: wasteData, error: wasteError } = await supabase
      .from("waste_tracking")
      .select("cost")
      .gte("date", thirtyDaysAgo.toISOString())

    if (wasteError) throw wasteError

    const wasteValue = wasteData?.reduce((sum, item) => sum + item.cost, 0) || 0

    return NextResponse.json({
      totalItems,
      lowStockCount,
      totalValue: totalValue.toFixed(2),
      wasteValue: wasteValue.toFixed(2),
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
