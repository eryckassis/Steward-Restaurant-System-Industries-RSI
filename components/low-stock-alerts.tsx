"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, AlertCircle, Info, RefreshCw, TrendingUp } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import type { InventoryItem } from "@/lib/types"
import { calculateStockStatus, formatQuantityWithUnit, formatCurrency } from "@/lib/validations"

export function LowStockAlerts() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLowStockItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inventory")

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error("Dados inválidos recebidos")
      }

      const filtered = data
        .filter((item: InventoryItem) => {
          const status = calculateStockStatus(item.quantity, item.min_stock)
          return status.status !== "good"
        })
        .sort((a: InventoryItem, b: InventoryItem) => {
          // Sort by severity (critical first)
          const ratioA = a.quantity / a.min_stock
          const ratioB = b.quantity / b.min_stock
          return ratioA - ratioB
        })
        .slice(0, 5)

      setLowStockItems(filtered)
    } catch (error) {
      console.error("[v0] Error fetching low stock items:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar alertas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLowStockItems()
  }, [fetchLowStockItems])

  const totalAtRisk = lowStockItems.reduce((total, item) => {
    return total + item.quantity * item.cost_per_unit
  }, 0)

  const getSeverityIcon = (status: "critical" | "low" | "medium" | "good") => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-5 w-5" />
      case "low":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getRecommendation = (item: InventoryItem) => {
    const status = calculateStockStatus(item.quantity, item.min_stock)
    const deficit = item.min_stock - item.quantity

    if (status.status === "critical") {
      return `Reabastecer urgente: +${formatQuantityWithUnit(Math.max(deficit * 2, item.min_stock), item.unit)}`
    }
    if (status.status === "low") {
      return `Considerar compra: +${formatQuantityWithUnit(Math.max(deficit * 1.5, item.min_stock * 0.5), item.unit)}`
    }
    return `Monitorar estoque`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alertas de Estoque</CardTitle>
            <CardDescription>Itens que precisam de atenção</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchLowStockItems} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchLowStockItems} className="mt-2 bg-transparent">
              Tentar novamente
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="font-medium text-sm">Estoque em dia!</p>
            <p className="text-xs text-muted-foreground mt-1">Todos os itens estão acima do estoque mínimo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => {
              const status = calculateStockStatus(item.quantity, item.min_stock)

              return (
                <div key={item.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 ${
                        status.status === "critical"
                          ? "text-destructive"
                          : status.status === "low"
                            ? "text-amber-500"
                            : "text-blue-500"
                      }`}
                    >
                      {getSeverityIcon(status.status)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <Badge
                          variant={
                            status.status === "critical"
                              ? "destructive"
                              : status.status === "low"
                                ? "default"
                                : "secondary"
                          }
                          className="shrink-0"
                        >
                          {status.label}
                        </Badge>
                      </div>

                      <Progress
                        value={status.percentage}
                        className={`h-1.5 ${
                          status.status === "critical"
                            ? "[&>div]:bg-destructive"
                            : status.status === "low"
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-blue-500"
                        }`}
                      />

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatQuantityWithUnit(item.quantity, item.unit)} /{" "}
                          {formatQuantityWithUnit(item.min_stock, item.unit)}
                        </span>
                        <span className="text-right">{formatCurrency(item.quantity * item.cost_per_unit)}</span>
                      </div>

                      <p className="text-xs text-muted-foreground italic">{getRecommendation(item)}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {lowStockItems.length > 0 && (
              <div className="pt-3 border-t mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{lowStockItems.length} item(ns) com estoque baixo</span>
                  <span className="font-medium">{formatCurrency(totalAtRisk)} em estoque</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
