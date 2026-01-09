import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { validateInventoryItem } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    let query = supabase.from("inventory_items").select("*");

    // Search by name
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Filter by category
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Filter by status
    if (status && status !== "all") {
      // We need to get all items first to calculate status
      const { data: allItems, error: fetchError } = await query.order("name", {
        ascending: true,
      });

      if (fetchError) throw fetchError;

      const filteredItems = allItems.filter((item) => {
        const ratio = item.quantity / item.min_stock;
        let itemStatus = "good";
        if (ratio <= 0.3) itemStatus = "critical";
        else if (ratio <= 0.6) itemStatus = "low";
        else if (ratio <= 1) itemStatus = "medium";

        return itemStatus === status;
      });

      return NextResponse.json(filteredItems);
    }

    const { data: items, error } = await query.order("name", {
      ascending: true,
    });

    if (error) throw error;

    return NextResponse.json(items);
  } catch (error) {
    console.error("[v0] Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    const body = await request.json();

    const validation = validateInventoryItem({
      name: body.name || "",
      category: body.category || "",
      quantity: body.quantity?.toString() || "",
      unit: body.unit || "",
      min_stock: body.min_stock?.toString() || "",
      cost_per_unit: body.cost_per_unit?.toString() || "",
      supplier: body.supplier,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const quantity = Number.parseFloat(body.quantity);
    const minStock = Number.parseFloat(body.min_stock);
    const costPerUnit = Number.parseFloat(body.cost_per_unit);

    if (isNaN(quantity) || isNaN(minStock) || isNaN(costPerUnit)) {
      return NextResponse.json(
        { error: "Valores numéricos inválidos" },
        { status: 400 }
      );
    }

    const { data: existingItem } = await supabase
      .from("inventory_items")
      .select("id")
      .ilike("name", body.name.trim())
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: "Já existe um item com este nome" },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from("inventory_items")
      .insert({
        name: body.name.trim(),
        category: body.category,
        quantity: quantity,
        unit: body.unit,
        min_stock: minStock,
        cost_per_unit: costPerUnit,
        supplier: body.supplier?.trim() || null,
        image_url: body.image_url || null,
        last_restocked: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log the activity
    await supabase.from("activity_log").insert({
      item_id: item.id,
      action: "add",
      quantity: quantity,
      description: `Novo item adicionado: ${body.name.trim()}`,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[v0] Error creating inventory item:", error);
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}
