import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const supabase = await createClient();
  const authResult = await requireAuth(supabase);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { userId } = authResult;

  try {
    // Fetch restaurant profile
    const { data: restaurant } = await supabase
      .from("restaurant_profile")
      .select("*")
      .single();

    // Fetch inventory summary
    const { data: inventory } = await supabase
      .from("inventory_items")
      .select("*");

    const totalValue =
      inventory?.reduce(
        (sum, item) => sum + item.quantity * item.cost_per_unit,
        0
      ) || 0;
    const lowStockItems =
      inventory?.filter(
        (item) => item.quantity <= item.min_stock && item.quantity > 0
      ).length || 0;
    const criticalStockItems =
      inventory?.filter((item) => item.quantity === 0).length || 0;

    // Fetch waste tracking (last 30 days)
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: wasteData } = await supabase
      .from("waste_tracking")
      .select("*")
      .gte("created_at", thirtyDaysAgo);

    const totalWaste = wasteData?.reduce((sum, w) => sum + w.quantity, 0) || 0;
    const totalWasteCost = wasteData?.reduce((sum, w) => sum + w.cost, 0) || 0;

    // Fetch stock movements (last 30 days)
    const { data: movements } = await supabase
      .from("stock_movements")
      .select("*")
      .gte("created_at", thirtyDaysAgo);

    const totalEntries =
      movements
        ?.filter((m) => m.type === "entrada")
        .reduce((sum, m) => sum + m.quantity, 0) || 0;
    const totalExits =
      movements
        ?.filter((m) => m.type === "saida")
        .reduce((sum, m) => sum + m.quantity, 0) || 0;
    const totalWasteMovements =
      movements
        ?.filter((m) => m.type === "desperdicio")
        .reduce((sum, m) => sum + m.quantity, 0) || 0;

    const { data: settings } = await supabase
      .from("system_settings")
      .select("waste_safe_threshold, waste_critical_threshold")
      .eq("user_id", userId)
      .single();

    const wasteThresholds = {
      safe: settings?.waste_safe_threshold || 100,
      critical: settings?.waste_critical_threshold || 300,
    };

    const reportData = {
      period: `${new Date(thirtyDaysAgo).toLocaleDateString(
        "pt-BR"
      )} - ${new Date().toLocaleDateString("pt-BR")}`,
      generated_at: new Date().toISOString(),
      restaurant: restaurant || { name: "Restaurante", email: "", phone: "" },
      inventory_summary: {
        total_items: inventory?.length || 0,
        total_value: totalValue,
        low_stock_items: lowStockItems,
        critical_stock_items: criticalStockItems,
      },
      waste_summary: {
        total_waste: totalWaste,
        total_cost: totalWasteCost,
        by_category: [],
      },
      stock_movements: {
        total_entries: totalEntries,
        total_exits: totalExits,
        total_waste: totalWasteMovements,
      },
      top_items: {
        most_used: inventory?.slice(0, 5) || [],
        most_wasted: [],
      },
      waste_thresholds: wasteThresholds,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("[v0] Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
