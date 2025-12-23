import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"
import { validateInventoryItem } from "@/lib/validations"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const validation = validateInventoryItem({
      name: body.name || "",
      category: body.category || "",
      quantity: body.quantity?.toString() || "",
      unit: body.unit || "",
      min_stock: body.min_stock?.toString() || "",
      cost_per_unit: body.cost_per_unit?.toString() || "",
      supplier: body.supplier,
    })

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0]?.message || "Dados inválidos" }, { status: 400 })
    }

    const quantity = Number.parseFloat(body.quantity)
    const minStock = Number.parseFloat(body.min_stock)
    const costPerUnit = Number.parseFloat(body.cost_per_unit)

    if (isNaN(quantity) || isNaN(minStock) || isNaN(costPerUnit)) {
      return NextResponse.json({ error: "Valores numéricos inválidos" }, { status: 400 })
    }

    // Check for duplicate name (excluding current item)
    const { data: existingItem } = await supabase
      .from("inventory_items")
      .select("id")
      .ilike("name", body.name.trim())
      .neq("id", id)
      .single()

    if (existingItem) {
      return NextResponse.json({ error: "Já existe outro item com este nome" }, { status: 400 })
    }

    // Get the old item for comparison
    const { data: oldItem } = await supabase.from("inventory_items").select("*").eq("id", id).single()

    if (!oldItem) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    }

    const { data: item, error } = await supabase
      .from("inventory_items")
      .update({
        name: body.name.trim(),
        category: body.category,
        quantity: quantity,
        unit: body.unit,
        min_stock: minStock,
        cost_per_unit: costPerUnit,
        supplier: body.supplier?.trim() || null,
        image_url: body.image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Log the activity with better description
    let description = `Item atualizado: ${body.name.trim()}`
    if (oldItem.quantity !== quantity) {
      const diff = quantity - oldItem.quantity
      description =
        diff > 0
          ? `Estoque ajustado: ${body.name.trim()} (+${diff.toFixed(2)} ${body.unit})`
          : `Estoque ajustado: ${body.name.trim()} (${diff.toFixed(2)} ${body.unit})`
    }

    await supabase.from("activity_log").insert({
      item_id: item.id,
      action: "update",
      quantity: quantity,
      description,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("[v0] Error updating inventory item:", error)
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const { id } = await params

    const { data: item, error: fetchError } = await supabase
      .from("inventory_items")
      .select("name, quantity, cost_per_unit")
      .eq("id", id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    }

    // Check for pending stock movements
    const { count: movementCount } = await supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("item_id", id)

    const { error } = await supabase.from("inventory_items").delete().eq("id", id)

    if (error) throw error

    // Log the activity with more details
    await supabase.from("activity_log").insert({
      item_id: null,
      action: "delete",
      quantity: item.quantity,
      description: `Item removido: ${item.name} (${movementCount || 0} movimentações no histórico)`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting inventory item:", error)
    return NextResponse.json({ error: "Erro ao remover item" }, { status: 500 })
  }
}
