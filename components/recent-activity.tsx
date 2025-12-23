"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import type { ActivityLog } from "@/lib/types"
import { Plus, Trash2, Package, AlertTriangle, RefreshCw, Edit, PackagePlus, PackageMinus, Clock } from "lucide-react"

function ActivityIcon({ action }: { action: string }) {
  const actionLower = action.toLowerCase()

  const getIcon = () => {
    if (actionLower.includes("adicionado") || actionLower.includes("add") || actionLower.includes("criado")) {
      return Plus
    }
    if (actionLower.includes("entrada") || actionLower.includes("restock") || actionLower.includes("reposto")) {
      return PackagePlus
    }
    if (actionLower.includes("saída") || actionLower.includes("saida") || actionLower.includes("consumo")) {
      return PackageMinus
    }
    if (actionLower.includes("remov") || actionLower.includes("delet") || actionLower.includes("exclu")) {
      return Trash2
    }
    if (actionLower.includes("desperdício") || actionLower.includes("desperdicio") || actionLower.includes("waste")) {
      return Trash2
    }
    if (actionLower.includes("vencid") || actionLower.includes("expir") || actionLower.includes("validade")) {
      return AlertTriangle
    }
    if (actionLower.includes("inicial") || actionLower.includes("initial") || actionLower.includes("estoque inicial")) {
      return Package
    }
    if (actionLower.includes("atualiza") || actionLower.includes("edit") || actionLower.includes("alter")) {
      return Edit
    }
    if (actionLower.includes("ajuste") || actionLower.includes("adjust")) {
      return RefreshCw
    }
    return Clock
  }

  const Icon = getIcon()

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 border border-border bg-background">
      <Icon className="h-4 w-4 text-foreground" />
    </div>
  )
}

function ActivityBadge({ action }: { action: string }) {
  const actionLower = action.toLowerCase()

  const getLabel = () => {
    if (actionLower.includes("adicionado") || actionLower.includes("add") || actionLower.includes("criado")) {
      return "Novo"
    }
    if (actionLower.includes("entrada") || actionLower.includes("restock")) {
      return "Entrada"
    }
    if (actionLower.includes("saída") || actionLower.includes("saida")) {
      return "Saída"
    }
    if (actionLower.includes("remov") || actionLower.includes("delet") || actionLower.includes("exclu")) {
      return "Removido"
    }
    if (actionLower.includes("desperdício") || actionLower.includes("desperdicio") || actionLower.includes("waste")) {
      return "Desperdício"
    }
    if (actionLower.includes("vencid") || actionLower.includes("expir")) {
      return "Vencido"
    }
    if (actionLower.includes("inicial") || actionLower.includes("initial")) {
      return "Inicial"
    }
    if (actionLower.includes("atualiza") || actionLower.includes("edit")) {
      return "Editado"
    }
    if (actionLower.includes("ajuste")) {
      return "Ajuste"
    }
    return "Atividade"
  }

  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-border bg-muted text-muted-foreground">
      {getLabel()}
    </span>
  )
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activity")
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("[v0] Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "agora"
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays}d atrás`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas ações no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse bg-muted rounded" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <ActivityIcon action={activity.action} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                    <ActivityBadge action={activity.action} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
