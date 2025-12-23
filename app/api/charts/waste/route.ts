import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar desperdícios dos últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Tentar buscar da tabela waste_tracking
    const { data: wasteData, error: wasteError } = await supabase
      .from("waste_tracking")
      .select("quantity, cost, date, created_at")
      .gte("created_at", sixMonthsAgo.toISOString())

    // Também buscar movimentações de desperdício
    const { data: movements, error: movementsError } = await supabase
      .from("stock_movements")
      .select("quantity, cost, created_at")
      .eq("type", "desperdicio")
      .gte("created_at", sixMonthsAgo.toISOString())

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const today = new Date()

    // Agrupar por mês
    const monthlyWaste = new Map<string, number>()

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      monthlyWaste.set(key, 0)
    }

    // Processar waste_tracking
    if (!wasteError && wasteData) {
      wasteData.forEach((w) => {
        const date = new Date(w.date || w.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        if (monthlyWaste.has(key)) {
          monthlyWaste.set(key, (monthlyWaste.get(key) || 0) + (w.cost || 0))
        }
      })
    }

    // Processar movimentações de desperdício
    if (!movementsError && movements) {
      movements.forEach((m) => {
        const date = new Date(m.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        if (monthlyWaste.has(key)) {
          monthlyWaste.set(key, (monthlyWaste.get(key) || 0) + (m.cost || 0))
        }
      })
    }

    // Construir dados do gráfico
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = monthNames[date.getMonth()]

      chartData.push({
        month: monthName,
        value: Math.round((monthlyWaste.get(key) || 0) * 100) / 100,
        date: date.toISOString().split("T")[0],
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error in waste chart API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
