import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"
import { validateStockMovement, VALIDATION_LIMITS } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("item_id")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit") || "50"

    let query = supabase
      .from("stock_movements")
      .select(`
        *,
        inventory_items(name)
      `)
      .order("created_at", { ascending: false })
      .limit(Number.parseInt(limit))

    if (itemId) {
      query = query.eq("item_id", itemId)
    }

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching stock movements:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const movements =
      data?.map((m) => ({
        ...m,
        item_name: m.inventory_items?.name || "Item removido",
      })) || []

    return NextResponse.json(movements)
  } catch (error) {
    console.error("Error in stock movements API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const body = await request.json()
    const { item_id, type, quantity, reason } = body

    if (!item_id || typeof item_id !== "string") {
      return NextResponse.json({ error: "ID do item é obrigatório" }, { status: 400 })
    }

    if (!["entrada", "saida", "desperdicio", "ajuste"].includes(type)) {
      return NextResponse.json({ error: "Tipo de movimentação inválido" }, { status: 400 })
    }

    // Buscar item atual
    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", item_id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
    }

    const validation = validateStockMovement(type, quantity, item.quantity, reason)

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0]?.message || "Dados inválidos" }, { status: 400 })
    }

    const qty = Number.parseFloat(quantity)

    if (isNaN(qty)) {
      return NextResponse.json({ error: "Quantidade deve ser um número válido" }, { status: 400 })
    }

    if (qty <= 0) {
      return NextResponse.json({ error: "Quantidade deve ser maior que zero" }, { status: 400 })
    }

    if (qty > VALIDATION_LIMITS.QUANTITY_MAX) {
      return NextResponse.json(
        { error: `Quantidade máxima permitida: ${VALIDATION_LIMITS.QUANTITY_MAX.toLocaleString("pt-BR")}` },
        { status: 400 },
      )
    }

    if ((type === "saida" || type === "desperdicio") && qty > item.quantity) {
      return NextResponse.json(
        { error: `Quantidade insuficiente. Estoque disponível: ${item.quantity.toFixed(2)} ${item.unit}` },
        { status: 400 },
      )
    }

    if (type === "desperdicio") {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json(
          { error: "Motivo é obrigatório para desperdício (mínimo 5 caracteres)" },
          { status: 400 },
        )
      }
      if (reason.length > VALIDATION_LIMITS.REASON_MAX_LENGTH) {
        return NextResponse.json(
          { error: `Motivo deve ter no máximo ${VALIDATION_LIMITS.REASON_MAX_LENGTH} caracteres` },
          { status: 400 },
        )
      }
    }

    const previousQuantity = item.quantity
    let newQuantity = previousQuantity
    let cost = 0

    // Calcular nova quantidade baseado no tipo
    switch (type) {
      case "entrada":
        newQuantity = previousQuantity + qty
        break
      case "saida":
      case "desperdicio":
        newQuantity = Math.max(0, previousQuantity - qty)
        cost = qty * item.cost_per_unit
        break
      case "ajuste":
        newQuantity = qty
        break
    }

    if (newQuantity > VALIDATION_LIMITS.QUANTITY_MAX) {
      return NextResponse.json(
        {
          error: `Quantidade final excede o limite máximo de ${VALIDATION_LIMITS.QUANTITY_MAX.toLocaleString("pt-BR")}`,
        },
        { status: 400 },
      )
    }

    // Atualizar quantidade do item
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
        last_restocked: type === "entrada" ? new Date().toISOString() : item.last_restocked,
      })
      .eq("id", item_id)

    if (updateError) {
      return NextResponse.json({ error: "Erro ao atualizar estoque" }, { status: 500 })
    }

    // Registrar movimentação
    const { data: movement, error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        item_id,
        type,
        quantity: qty,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        reason: reason?.trim() || null,
        cost,
      })
      .select()
      .single()

    if (movementError) {
      console.error("Error creating movement:", movementError)
    }

    // Registrar desperdício se for o caso
    if (type === "desperdicio") {
      await supabase.from("waste_tracking").insert({
        item_id,
        quantity: qty,
        reason: reason?.trim(),
        cost,
        date: new Date().toISOString(),
        item_name: item.name,
      })
    }

    // Criar notificação se estoque ficar baixo
    if (newQuantity <= item.min_stock) {
      const isCritical = newQuantity <= item.min_stock * 0.3
      await supabase.from("notifications").insert({
        type: isCritical ? "critical_stock" : "low_stock",
        title: isCritical ? "Estoque Crítico!" : "Estoque Baixo",
        message: `${item.name}: ${newQuantity.toFixed(2)} ${item.unit} (mínimo: ${item.min_stock} ${item.unit})`,
        item_id,
      })
    }

    // Criar notificação de desperdício
    if (type === "desperdicio") {
      await supabase.from("notifications").insert({
        type: "waste",
        title: "Desperdício Registrado",
        message: `${item.name}: ${qty.toFixed(2)} ${item.unit} - R$ ${cost.toFixed(2)} (${reason?.trim() || "Sem motivo"})`,
        item_id,
      })
    }

    // Registrar na activity log
    const actionLabels: Record<string, string> = {
      entrada: "Reabastecimento",
      saida: "Saída",
      desperdicio: "Desperdício",
      ajuste: "Ajuste",
    }

    await supabase.from("activity_log").insert({
      item_id,
      action: actionLabels[type] || type,
      quantity: qty,
      description: `${item.name}: ${previousQuantity.toFixed(2)} → ${newQuantity.toFixed(2)} ${item.unit}${reason ? ` (${reason.trim()})` : ""}`,
    })

    return NextResponse.json({ success: true, movement, newQuantity })
  } catch (error) {
    console.error("Error in stock movement POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
