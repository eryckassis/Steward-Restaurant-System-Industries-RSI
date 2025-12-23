"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalItems: number
  lowStockCount: number
  totalValue: string
  wasteValue: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("[v0] Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Itens em Estoque",
      value: stats.totalItems.toString(),
      change: "Total de produtos",
      trend: "up",
      icon: Package,
    },
    {
      title: "Valor Total",
      value: `R$ ${stats.totalValue}`,
      change: "Inventário total",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Desperdício (30d)",
      value: `R$ ${stats.wasteValue}`,
      change: "Últimos 30 dias",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "Alertas Ativos",
      value: stats.lowStockCount.toString(),
      change: "Estoque baixo",
      trend: "warning",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p
                    className={`text-xs ${
                      stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
