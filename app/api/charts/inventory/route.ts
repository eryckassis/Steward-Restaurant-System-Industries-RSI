import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar movimentações dos últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: movements, error: movementsError } = await supabase
      .from("stock_movements")
      .select("type, quantity, created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    // Buscar total atual do inventário
    const { data: items, error: itemsError } = await supabase.from("inventory_items").select("quantity")

    if (itemsError) {
      console.error("Error fetching inventory:", itemsError)
    }

    const currentTotal = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

    // Gerar dados dos últimos 6 meses com datas reais
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const chartData = []
    const today = new Date()

    // Calcular totais mensais baseado nas movimentações
    const monthlyData = new Map<string, { entradas: number; saidas: number }>()

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      monthlyData.set(key, { entradas: 0, saidas: 0 })
    }

    // Processar movimentações
    if (!movementsError && movements) {
      movements.forEach((m) => {
        const date = new Date(m.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        if (monthlyData.has(key)) {
          const data = monthlyData.get(key)!
          if (m.type === "entrada") {
            data.entradas += m.quantity
          } else {
            data.saidas += m.quantity
          }
        }
      })
    }

    // Construir dados do gráfico
    let runningTotal = currentTotal
    const monthKeys = Array.from(monthlyData.keys()).reverse()

    // Calcular totais retroativamente
    const totals: number[] = []
    monthKeys.forEach((key) => {
      const data = monthlyData.get(key)!
      totals.unshift(runningTotal)
      runningTotal = runningTotal - data.entradas + data.saidas
    })

    // Construir array final
    let index = 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const monthName = monthNames[date.getMonth()]

      chartData.push({
        month: monthName,
        value: Math.max(0, totals[index] || currentTotal),
        date: date.toISOString().split("T")[0],
      })
      index++
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error in inventory chart API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
